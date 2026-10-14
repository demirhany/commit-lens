package com.commitlens.commitlensapi.provider.internal.github.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import java.time.Instant

@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubOwnerDto(
    val login: String,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubRepoDto(
    val id: Long,
    val name: String,
    @JsonProperty("full_name") val fullName: String,
    val owner: GitHubOwnerDto,
    @JsonProperty("default_branch") val defaultBranch: String = "main",
    @JsonProperty("private") val isPrivate: Boolean,
    @JsonProperty("html_url") val htmlUrl: String,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubGitUserDto(
    val name: String,
    val email: String?,
    val date: Instant?
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubCommitDetailDto(
    val message: String,
    val author: GitHubGitUserDto
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubCommitItemDto(
    val sha: String,
    @JsonProperty("html_url") val htmlUrl: String?,
    val commit: GitHubCommitDetailDto
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubSearchCommitResponseDto(
    @JsonProperty("total_count") val totalCount: Int,
    val items: List<GitHubCommitItemDto>
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubFileDto(
    val filename: String,
    val status: String,
    val additions: Int = 0,
    val deletions: Int = 0,
    val changes: Int = 0,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubStatsDto(
    val total: Int = 0,
    val additions: Int = 0,
    val deletions: Int = 0
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubSingleCommitDto(
    val sha: String,
    @JsonProperty("html_url") val htmlUrl: String?,
    val commit: GitHubCommitDetailDto,
    val stats: GitHubStatsDto = GitHubStatsDto(),
    val files: List<GitHubFileDto> = emptyList()
)
