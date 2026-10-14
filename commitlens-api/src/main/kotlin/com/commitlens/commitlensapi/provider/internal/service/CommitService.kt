package com.commitlens.commitlensapi.provider.internal.service

import com.commitlens.commitlensapi.core.exception.EmptySearchQueryException
import com.commitlens.commitlensapi.core.exception.InvalidRequestParameterException
import com.commitlens.commitlensapi.core.exception.ProviderCapabilityNotSupportedException
import com.commitlens.commitlensapi.core.exception.ResourceNotFoundException
import com.commitlens.commitlensapi.core.model.UnifiedRepoDto
import com.commitlens.commitlensapi.core.model.commit.parsed.UnifiedCommitSearchResponseDto
import com.commitlens.commitlensapi.core.model.commit.parsed.UnifiedParsedCommitDetailDto
import com.commitlens.commitlensapi.core.model.commit.parsed.UnifiedParsedCommitDto
import com.commitlens.commitlensapi.core.parser.api.CommitParserApi
import com.commitlens.commitlensapi.provider.api.CommitAnalysisApi
import com.commitlens.commitlensapi.provider.api.GitProviderMetadataDto
import com.commitlens.commitlensapi.provider.api.GitProviderType
import com.commitlens.commitlensapi.provider.internal.strategy.GitProviderFactory
import com.commitlens.commitlensapi.provider.internal.strategy.RepositoryAwareGitProvider
import com.commitlens.commitlensapi.provider.internal.strategy.SearchableGitProvider
import org.springframework.stereotype.Service

@Service
class CommitService(
    private val gitProviderFactory: GitProviderFactory,
    private val commitParserApi: CommitParserApi
) : CommitAnalysisApi {

    override fun getSupportedProviders(): List<GitProviderMetadataDto> {
        try {
            return GitProviderType.entries.map { providerType ->
                val strategy = gitProviderFactory.getStrategy(providerType)
                GitProviderMetadataDto(
                    provider = providerType,
                    displayName = providerType.name.lowercase().replaceFirstChar { it.uppercase() },
                    capabilities = strategy.capabilities
                )
            }
        } catch (e: Exception) {
            throw ResourceNotFoundException("Failed to retrieve supported providers: ${e.message}")
        }
    }

    override fun getRepos(provider: GitProviderType): List<UnifiedRepoDto> {
        val strategy = gitProviderFactory.getStrategy(provider)
        if (strategy !is RepositoryAwareGitProvider) {
            throw ProviderCapabilityNotSupportedException("The provider '$provider' does not support listing repositories.")
        }
        return strategy.getRepos()
    }

    override fun getRepo(owner: String, repo: String, provider: GitProviderType): UnifiedRepoDto {
        val strategy = gitProviderFactory.getStrategy(provider)
        if (strategy !is RepositoryAwareGitProvider) {
            throw ProviderCapabilityNotSupportedException("The provider '$provider' does not support fetching repository details.")
        }
        return strategy.getRepo(owner, repo)
    }

    override fun searchCommits(
        owner: String,
        repo: String,
        query: String,
        page: Int,
        perPage: Int,
        provider: GitProviderType
    ): UnifiedCommitSearchResponseDto {

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
        val strategy = gitProviderFactory.getStrategy(provider)

        if (strategy !is SearchableGitProvider) {
            throw ProviderCapabilityNotSupportedException("The provider '$provider' does not support searching commits.")
        }

        // Search for commits using the strategy
        val searchResponse = strategy.searchCommits(owner, repo, query, page, perPage)
        val items = searchResponse.items

        // Map the raw commit data to the unified parsed commit DTOs
        val mapped = items.map { item ->
            UnifiedParsedCommitDto(
                rawCommitDto = item,
                parsedMessage = commitParserApi.parse(item.message ?: "")
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

    override fun getCommitDetails(
        owner: String,
        repo: String,
        sha: String,
        provider: GitProviderType
    ): UnifiedParsedCommitDetailDto {

        // Input validation
        if (sha.isBlank()) {
            throw InvalidRequestParameterException("'sha' must not be blank")
        }
        val strategy = gitProviderFactory.getStrategy(provider)
        val items = strategy.getCommitDetails(owner, repo, sha)
        return UnifiedParsedCommitDetailDto(
            parsedCommitDto = UnifiedParsedCommitDto(
                rawCommitDto = items.rawCommitDto,
                parsedMessage = commitParserApi.parse(items.rawCommitDto.message ?: "")
            ),
            totalAdditions = items.totalAdditions,
            totalDeletions = items.totalDeletions,
            files = items.files
        )
    }
}
