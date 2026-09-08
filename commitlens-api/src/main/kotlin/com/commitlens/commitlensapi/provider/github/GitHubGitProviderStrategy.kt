package com.commitlens.commitlensapi.provider.github

import com.commitlens.commitlensapi.core.model.UnifiedCommitDetailDto
import com.commitlens.commitlensapi.core.model.UnifiedFileDiffDto
import com.commitlens.commitlensapi.core.model.UnifiedRawCommitDto
import com.commitlens.commitlensapi.core.model.UnifiedRepoDto
import com.commitlens.commitlensapi.core.parser.ConventionalCommitParser
import com.commitlens.commitlensapi.provider.GitProviderStrategy
import com.commitlens.commitlensapi.provider.GitProviderType
import com.commitlens.commitlensapi.provider.github.client.GitHubRestClient
import org.springframework.stereotype.Component

@Component
class GitHubGitProviderStrategy(
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
        query: String
    ): List<UnifiedRawCommitDto> {
        return gitHubClient.searchCommits(owner, repo, query).map { item ->
            UnifiedRawCommitDto(
                sha = item.sha,
                message = item.commit.message,
                authorName = item.commit.author.name,
                authorEmail = item.commit.author.email,
                date = item.commit.author.date,
                htmlUrl = item.htmlUrl
            )
        }
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