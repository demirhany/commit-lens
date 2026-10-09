package com.commitlens.commitlensapi.core.service

import com.commitlens.commitlensapi.core.model.commit.parsed.UnifiedCommitSearchResponseDto
import com.commitlens.commitlensapi.core.model.commit.parsed.UnifiedParsedCommitDetailDto
import com.commitlens.commitlensapi.core.model.commit.parsed.UnifiedParsedCommitDto
import com.commitlens.commitlensapi.core.model.UnifiedRepoDto
import com.commitlens.commitlensapi.core.parser.ConventionalCommitParser
import com.commitlens.commitlensapi.exception.EmptySearchQueryException
import com.commitlens.commitlensapi.exception.InvalidRequestParameterException
import com.commitlens.commitlensapi.exception.ProviderCapabilityNotSupportedException
import com.commitlens.commitlensapi.provider.GitProviderFactory
import com.commitlens.commitlensapi.provider.GitProviderType
import com.commitlens.commitlensapi.provider.RepositoryAwareGitProvider
import com.commitlens.commitlensapi.provider.SearchableGitProvider
import com.commitlens.commitlensapi.provider.model.GitProviderMetadataDto
import org.springframework.stereotype.Service

@Service
class CommitService (private val gitProviderFactory: GitProviderFactory, private val conventionalCommitParser: ConventionalCommitParser) {

    fun getSupportedProviders(): List<GitProviderMetadataDto> {
        return GitProviderType.entries.map { providerType ->
            val strategy = gitProviderFactory.getStrategy(providerType)
            GitProviderMetadataDto(
                provider = providerType,
                displayName = providerType.name.lowercase().replaceFirstChar { it.uppercase() },
                capabilities = strategy.capabilities
            )
        }
    }

    fun getRepos(gitProviderType: GitProviderType): List<UnifiedRepoDto> {
        val strategy = gitProviderFactory.getStrategy(gitProviderType)
        if (strategy !is RepositoryAwareGitProvider) {
            throw ProviderCapabilityNotSupportedException("The provider '$gitProviderType' does not support listing repositories.")
        }
        return strategy.getRepos()
    }

    fun getRepo(owner: String, repo: String, gitProviderType: GitProviderType): UnifiedRepoDto {
        val strategy = gitProviderFactory.getStrategy(gitProviderType)
        if (strategy !is RepositoryAwareGitProvider) {
            throw ProviderCapabilityNotSupportedException("The provider '$gitProviderType' does not support fetching repository details.")
        }
        return strategy.getRepo(owner, repo)
    }

    fun searchCommits(owner: String, repo: String, query: String, page: Int = 1, perPage: Int = 100, gitProviderType: GitProviderType): UnifiedCommitSearchResponseDto {

        // Input validation
        if (query.isBlank()) {
            throw EmptySearchQueryException()
        }
        if (page <= 0) {
            throw InvalidRequestParameterException("'page' must be a positive integer, got: $page")
        }
        if (perPage <= 0) {
            throw InvalidRequestParameterException("'perPage' must be a positive integer, got: $perPage")
        }
        if (perPage > 100) {
            throw InvalidRequestParameterException("'perPage' must not exceed 100, got: $perPage")
        }

        // Get the appropriate strategy based on the Git provider type
        val strategy = gitProviderFactory.getStrategy(gitProviderType)

        if (strategy !is SearchableGitProvider) {
            throw ProviderCapabilityNotSupportedException("The provider '$gitProviderType' does not support searching commits.")
        }

        // Search for commits using the strategy
        val searchResponse = strategy.searchCommits(owner, repo, query, page, perPage)
        val items = searchResponse.items

        // Map the raw commit data to the unified parsed commit DTOs
        val mapped = items.map { item ->
            UnifiedParsedCommitDto(
                rawCommitDto = item,
                parsedMessage = conventionalCommitParser.parse(item.message ?: "")
            )
        }

        // Return the search response with total count, pagination info, and the mapped items
        return UnifiedCommitSearchResponseDto(
            totalCount = searchResponse.totalCount,
            page = searchResponse.page,
            perPage = searchResponse.perPage,
            items = mapped
        )
    }

    fun getCommitDetails(owner: String, repo: String, sha: String, gitProviderType: GitProviderType): UnifiedParsedCommitDetailDto {

        // Input validation
        if (sha.isBlank()) {
            throw InvalidRequestParameterException("'sha' must not be blank")
        }
        val strategy = gitProviderFactory.getStrategy(gitProviderType)
        val items = strategy.getCommitDetails(owner, repo, sha)
        return UnifiedParsedCommitDetailDto(
            parsedCommitDto = UnifiedParsedCommitDto(
                rawCommitDto = items.rawCommitDto,
                parsedMessage = conventionalCommitParser.parse(items.rawCommitDto.message ?: "")
            ),
            totalAdditions = items.totalAdditions,
            totalDeletions = items.totalDeletions,
            files = items.files
        )
    }
}