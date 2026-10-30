package com.commitlens.commitlensapi.provider.api.commit.raw

import java.time.Instant

data class UnifiedRawCommitDto(
    val sha: String,
    val message: String?,
    val authorName: String,
    val authorEmail: String?,
    val date: Instant?,
    val htmlUrl: String?,
)
