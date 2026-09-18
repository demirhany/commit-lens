package com.commitlens.commitlensapi.jira.model

import com.commitlens.commitlensapi.core.model.commit.parsed.UnifiedParsedCommitDto
import com.commitlens.commitlensapi.provider.GitProviderType

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
