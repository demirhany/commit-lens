package com.commitlens.commitlensapi.jira.service

import com.commitlens.commitlensapi.core.model.commit.parsed.UnifiedParsedCommitDto
import com.commitlens.commitlensapi.core.model.commit.raw.UnifiedRawCommitDto
import com.commitlens.commitlensapi.core.parser.ConventionalCommitParser
import com.commitlens.commitlensapi.core.util.logger
import com.commitlens.commitlensapi.jira.client.JiraRestClient
import com.commitlens.commitlensapi.jira.model.JiraCommitDto
import com.commitlens.commitlensapi.jira.model.JiraIssueCommitResponseDto
import com.commitlens.commitlensapi.jira.parser.JiraRepoUrlParser
import org.springframework.stereotype.Service

@Service
class JiraService(
    private val jiraRestClient: JiraRestClient,
    private val jiraRepoUrlParser: JiraRepoUrlParser,
    private val conventionalCommitParser: ConventionalCommitParser
) {
   private val log = logger()

    fun getIssueCommits(issueKey: String): JiraIssueCommitResponseDto {

        // Fetch the issue details from Jira
        val issue = jiraRestClient.getIssue(issueKey)

        // Fetch the development status for the issue to get associated commits
        val devStatus = jiraRestClient.getDevStatus(issue.id)

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
                            parsedMessage = conventionalCommitParser.parse(rawCommit.message)
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