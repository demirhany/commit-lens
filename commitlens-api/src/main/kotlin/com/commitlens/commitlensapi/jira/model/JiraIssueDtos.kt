package com.commitlens.commitlensapi.jira.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.time.Instant

@JsonIgnoreProperties(ignoreUnknown = true)
data class JiraIssueDto(
    val id: String,
    val key: String,
    val fields: JiraIssueFieldsDto?
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class JiraIssueFieldsDto(
    val summary: String
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class JiraDevStatusResponseDto(
    val detail: List<JiraDevStatusDetailDto> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class JiraDevStatusDetailDto(
    val repositories: List<JiraDevStatusRepositoryDto> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class JiraDevStatusRepositoryDto(
    val name: String,
    val url: String,
    val commits: List<JiraDevStatusCommitDto> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class JiraDevStatusCommitDto(
    val id: String,
    val displayId: String?,
    val message: String?,
    val author: JiraDevStatusAuthorDto?,
    val authorTimestamp: Instant?,
    val url: String?
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class JiraDevStatusAuthorDto(
    val name: String?
)