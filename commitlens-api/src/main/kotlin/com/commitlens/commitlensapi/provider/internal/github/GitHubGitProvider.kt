package com.commitlens.commitlensapi.provider.internal.github

import com.commitlens.commitlensapi.core.model.UnifiedFileDiffDto
import com.commitlens.commitlensapi.core.model.UnifiedRepoDto
import com.commitlens.commitlensapi.core.model.commit.raw.UnifiedRawCommitDetailDto
import com.commitlens.commitlensapi.core.model.commit.raw.UnifiedRawCommitDto
import com.commitlens.commitlensapi.core.model.commit.raw.UnifiedRawCommitSearchResponseDto
import com.commitlens.commitlensapi.provider.api.GitProviderType
import com.commitlens.commitlensapi.provider.internal.github.client.GitHubRestClient
import com.commitlens.commitlensapi.provider.internal.strategy.RepositoryAwareGitProvider
import com.commitlens.commitlensapi.provider.internal.strategy.SearchableGitProvider
import org.springframework.stereotype.Component

@Component
class GitHubGitProvider(private val gitHubClient: GitHubRestClient) : SearchableGitProvider, RepositoryAwareGitProvider {
    override val providerType: GitProviderType = GitProviderType.GITHUB

    override fun getRepos(): List<UnifiedRepoDto> {
        return gitHubClient.getAllUserRepos().map { repo ->
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
    ): UnifiedRawCommitSearchResponseDto {

        // Query sanitization: GitHub's search API requires exact phrase matching for commit messages, so we wrap the query in double quotes if it's not already.
        val trimmedQuery = query.trim()
        val exactQuery = if (trimmedQuery.startsWith("\"") && trimmedQuery.endsWith("\"")) {
            trimmedQuery
        } else {
            "\"$trimmedQuery\""
        }

        // Search commits using the GitHub client
        val searchResponse = gitHubClient.searchCommits(owner, repo, exactQuery, page, perPage)
        val items = searchResponse.items
        val totalCount = searchResponse.totalCount

        // Map the raw commit data from GitHub to the unified commit DTO format
        return UnifiedRawCommitSearchResponseDto(
            totalCount = totalCount,
            page = page,
            perPage = perPage,
            items = items.map { item ->
                UnifiedRawCommitDto(
                    sha = item.sha,
                    message = item.commit.message,
                    authorName = item.commit.author.name,
                    authorEmail = item.commit.author.email,
                    date = item.commit.author.date,
                    htmlUrl = item.htmlUrl
                )
            }
        )
    }

    override fun getCommitDetails(
        owner: String,
        repo: String,
        sha: String
    ): UnifiedRawCommitDetailDto {
        val rawCommit = gitHubClient.getCommitDetail(owner, repo, sha)

        return UnifiedRawCommitDetailDto(
            UnifiedRawCommitDto(
                sha = rawCommit.sha,
                message = rawCommit.commit.message,
                authorName = rawCommit.commit.author.name,
                authorEmail = rawCommit.commit.author.email,
                date = rawCommit.commit.author.date,
                htmlUrl = rawCommit.htmlUrl
            ),
            totalAdditions = rawCommit.stats.additions,
            totalDeletions = rawCommit.stats.deletions,
            files = rawCommit.files.map { file ->
                UnifiedFileDiffDto(
                    filename = file.filename,
                    status = file.status,
                    additions = file.additions,
                    deletions = file.deletions,
                    changes = file.changes,
                )
            }
        )
    }
}
