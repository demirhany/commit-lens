package com.commitlens.commitlensapi.jira.internal.model

import com.commitlens.commitlensapi.provider.api.commit.parsed.UnifiedParsedCommitDto
import com.commitlens.commitlensapi.provider.api.GitProviderType

data class JiraIssueCommitResponseDto(
    val issueKey: String,
    val summary: String? = "No summary available",
    val totalCommits: Int,
    val commits: List<JiraCommitDto>
)

data class JiraCommitDto(
    val provider: GitProviderType,
    val owner: String,
    val repo: String,
    val commit: UnifiedParsedCommitDto,
    val repoName: String? = ""
)
