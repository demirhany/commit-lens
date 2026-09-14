package com.commitlens.commitlensapi.provider.bitbucket.model

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.Instant

data class BitbucketPagedResponse<T>(
    val pagelen: Int,
    val page: Int = 1,
    val size: Int? = null,
    val next: String? = null,
    val values: List<T> = emptyList()
)

data class BitbucketLinkDto(
    val href: String
)

data class BitbucketLinksDto(
    val html: BitbucketLinkDto? = null
)

data class BitbucketUserDto(
    @JsonProperty("display_name") val displayName: String?,
    val uuid: String?
)

data class BitbucketAuthorDto(
    val raw: String, // Örn: "Jane Doe <jane@example.com>"
    val user: BitbucketUserDto? = null
)

data class BitbucketCommitDto(
    val hash: String,
    val message: String,
    val date: Instant,
    val author: BitbucketAuthorDto,
    val links: BitbucketLinksDto
)

data class BitbucketFileRefDto(
    val path: String
)

data class BitbucketDiffStatDto(
    val status: String,
    @JsonProperty("lines_added") val linesAdded: Int = 0,
    @JsonProperty("lines_removed") val linesRemoved: Int = 0,
    @JsonProperty("old") val oldFile: BitbucketFileRefDto?,
    @JsonProperty("new") val newFile: BitbucketFileRefDto?
)