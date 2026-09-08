package com.commitlens.commitlensapi.provider.github

import com.commitlens.commitlensapi.core.model.UnifiedCommitDetailDto
import com.commitlens.commitlensapi.core.model.UnifiedCommitSearchResponseDto
import com.commitlens.commitlensapi.core.model.UnifiedFileDiffDto
import com.commitlens.commitlensapi.core.model.UnifiedRawCommitDto
import com.commitlens.commitlensapi.core.model.UnifiedRepoDto
import com.commitlens.commitlensapi.core.parser.ConventionalCommitParser
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

    override fun searchCommits(
        owner: String,
        repo: String,
        query: String,
        limit: Int
    ): UnifiedCommitSearchResponseDto {
        val allCommits = mutableListOf<UnifiedRawCommitDto>() // List to hold all commits fetched across pages
        var currentPage = 1 // Start from the first page
        val perPage = 100 // GitHub API allows a maximum of 100 items per page
        var commitTotalCount = 0

        // Loop to fetch commits page by page until we reach the limit or there are no more commits
        while (allCommits.size < limit) {

            // Fetch commits from the GitHub API for the current page
            val searchResponse = gitHubClient.searchCommits(owner, repo, query, currentPage, perPage) ?: break
            if (currentPage == 1) {
                commitTotalCount = searchResponse.totalCount
            }

            val items = searchResponse.items

            // If no items are returned, break the loop as there are no more commits to fetch
            if (items.isEmpty()) break

            // Map the raw commit items to the unified commit DTO format
            val mapped = items.map { item ->
                UnifiedRawCommitDto(
                    sha = item.sha,
                    message = item.commit.message,
                    authorName = item.commit.author.name,
                    authorEmail = item.commit.author.email,
                    date = item.commit.author.date,
                    htmlUrl = item.htmlUrl
                )
            }

            // Add the mapped commits to the allCommits list
            allCommits.addAll(mapped)

            // If the number of items fetched is less than perPage or we've reached the total count, break the loop
            if (items.size < perPage || allCommits.size >= searchResponse.totalCount) break
            currentPage++
        }

        // Return only the number of commits up to the specified limit
        return UnifiedCommitSearchResponseDto(
            totalCount = commitTotalCount,
            limit = limit,
            items = allCommits.take(limit)
        )
    }

    override fun getCommitDetails(
        owner: String,
        repo: String,
        sha: String
    ): UnifiedCommitDetailDto {
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
//                    patch = file.patch
                )
            }
        )
    }
}