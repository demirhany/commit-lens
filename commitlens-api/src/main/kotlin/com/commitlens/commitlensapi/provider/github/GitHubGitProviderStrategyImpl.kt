package com.commitlens.commitlensapi.provider.github

import com.commitlens.commitlensapi.core.model.UnifiedCommitDetailDto
import com.commitlens.commitlensapi.core.model.UnifiedCommitSearchResponseDto
import com.commitlens.commitlensapi.core.model.UnifiedFileDiffDto
import com.commitlens.commitlensapi.core.model.UnifiedRawCommitDto
import com.commitlens.commitlensapi.core.model.UnifiedRepoDto
import com.commitlens.commitlensapi.core.parser.ConventionalCommitParser
import com.commitlens.commitlensapi.exception.EmptySearchQueryException
import com.commitlens.commitlensapi.exception.InvalidRequestParameterException
import com.commitlens.commitlensapi.provider.GitProviderStrategy
import com.commitlens.commitlensapi.provider.GitProviderType
import com.commitlens.commitlensapi.provider.github.client.GitHubRestClient
import org.springframework.stereotype.Component

@Component
class GitHubGitProviderStrategyImpl(
    private val gitHubClient: GitHubRestClient, private val conventionalCommitParser: ConventionalCommitParser
) : GitProviderStrategy {
    override val providerType: GitProviderType = GitProviderType.GITHUB

    override fun getRepos(): List<UnifiedRepoDto> {
        return gitHubClient.getUserRepos().map { repo ->
            UnifiedRepoDto(
                id = repo.id.toString(),
                name = repo.name,
                fullName = repo.fullName,
                owner = repo.owner.login,
                defaultBranch = repo.defaultBranch,
                isPrivate = repo.isPrivate,
                htmlUrl = repo.htmlUrl
            )
        }
    }

    // Fetch and return detailed information about a specific repository from GitHub
    override fun getRepo(
        owner: String,
        repo: String
    ): UnifiedRepoDto {
        val repoDetails = gitHubClient.getRepo(owner, repo)
        return UnifiedRepoDto(
            id = repoDetails.id.toString(),
            name = repoDetails.name,
            fullName = repoDetails.fullName,
            owner = repoDetails.owner.login,
            defaultBranch = repoDetails.defaultBranch,
            isPrivate = repoDetails.isPrivate,
            htmlUrl = repoDetails.htmlUrl
        )
    }

    override fun searchCommits(
        owner: String,
        repo: String,
        query: String,
        page: Int,
        perPage: Int
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

        val trimmedQuery = query.trim()
        val exactQuery = if (trimmedQuery.startsWith("\"") && trimmedQuery.endsWith("\"")) {
            trimmedQuery
        } else {
            "\"$trimmedQuery\""
        }

        val searchResponse = gitHubClient.searchCommits(owner, repo, exactQuery, page, perPage)
        val items = searchResponse.items
        val mapped = items.map { item ->
            UnifiedRawCommitDto(
                sha = item.sha,
                parsedMessage = conventionalCommitParser.parse(item.commit.message),
                authorName = item.commit.author.name,
                authorEmail = item.commit.author.email,
                date = item.commit.author.date,
                htmlUrl = item.htmlUrl
            )
        }

        // Return only the number of commits up to the specified limit
        return UnifiedCommitSearchResponseDto(
            totalCount = searchResponse.totalCount,
            page = page,
            perPage = perPage,
            items = mapped
        )
    }

    override fun getCommitDetails(
        owner: String,
        repo: String,
        sha: String
    ): UnifiedCommitDetailDto {
        // Input validation
        if (sha.isBlank()) {
            throw InvalidRequestParameterException("'sha' must not be blank")
        }

        val rawCommit = gitHubClient.getCommitDetail(owner, repo, sha)
        val parsed = conventionalCommitParser.parse(rawCommit.commit.message)

        return UnifiedCommitDetailDto(
            sha = rawCommit.sha,
            htmlUrl = rawCommit.htmlUrl,
            authorName = rawCommit.commit.author.name,
            authorEmail = rawCommit.commit.author.email,
            date = rawCommit.commit.author.date,
            parsedMessage = parsed,
            totalAdditions = rawCommit.stats.additions,
            totalDeletions = rawCommit.stats.deletions,
            files = rawCommit.files.map { file ->
                UnifiedFileDiffDto(
                    filename = file.filename,
                    status = file.status,
                    additions = file.additions,
                    deletions = file.deletions,
                    changes = file.changes,
                    // patch = file.patch
                )
            }
        )
    }

}