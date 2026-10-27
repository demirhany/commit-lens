package com.commitlens.commitlensapi.jira.internal.service

import com.commitlens.commitlensapi.provider.api.commit.parsed.UnifiedParsedCommitDto
import com.commitlens.commitlensapi.provider.api.commit.raw.UnifiedRawCommitDto
import com.commitlens.commitlensapi.parser.api.CommitParserApi
import com.commitlens.commitlensapi.parser.api.dto.CommitPolicyDto
import com.commitlens.commitlensapi.core.util.logger
import com.commitlens.commitlensapi.jira.internal.client.JiraRestClient
import com.commitlens.commitlensapi.jira.internal.model.JiraCommitDto
import com.commitlens.commitlensapi.jira.internal.model.JiraIssueCommitResponseDto
import com.commitlens.commitlensapi.jira.internal.parser.JiraRepoUrlParser
import com.commitlens.commitlensapi.specification.api.CommitSpecificationApi
import org.springframework.stereotype.Service

@Service
class JiraService(
    private val jiraRestClient: JiraRestClient,
    private val jiraRepoUrlParser: JiraRepoUrlParser,
    private val commitParserApi: CommitParserApi,
    private val commitSpecificationApi: CommitSpecificationApi
) {
    private val log = logger()

    fun getIssueCommits(issueKey: String, profileName: String? = null): JiraIssueCommitResponseDto {

        // Fetch the issue details from Jira
        val issue = jiraRestClient.getIssue(issueKey)

        // Fetch the development status for the issue to get associated commits
        val devStatus = jiraRestClient.getDevStatus(issue.id)

        val policy: CommitPolicyDto = commitSpecificationApi.getCommitPolicy(profileName)

        val commits = devStatus.detail.flatMap { detail ->
            detail.repositories.flatMap { repo ->
                val repoInfo = jiraRepoUrlParser.parseOrNull(repo.url)
                if (repoInfo == null) {
                    log.warn("Could not parse repository URL: ${repo.url}. Skipping commits for this repository.")
                    emptyList()
                } else {
                    repo.commits.map { jiraCommit ->
                        val rawCommit = UnifiedRawCommitDto(
                            sha = jiraCommit.id,
                            message = jiraCommit.message,
                            authorName = jiraCommit.author?.name ?: "Unknown",
                            authorEmail = null,
                            date = jiraCommit.authorTimestamp,
                            htmlUrl = jiraCommit.url
                        )

                        val parsedCommit = UnifiedParsedCommitDto(
                            rawCommitDto = rawCommit,
                            parsedMessage = commitParserApi.parse(rawCommit.message, policy)
                        )

                        JiraCommitDto(
                            provider = repoInfo.provider,
                            owner = repoInfo.owner,
                            repo = repoInfo.repo,
                            commit = parsedCommit,
                            repoName = repo.name,
                        )
                    }
                }
            }
        }

        return JiraIssueCommitResponseDto(
            issueKey = issue.key, summary = issue.fields?.summary ?: "No summary available", totalCommits = commits.size, commits = commits
        )
    }
}
