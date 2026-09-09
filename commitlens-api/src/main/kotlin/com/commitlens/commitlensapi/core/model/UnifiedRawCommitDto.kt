package com.commitlens.commitlensapi.core.model

import com.commitlens.commitlensapi.core.parser.ParsedCommitMessageDto
import java.time.Instant

data class UnifiedRawCommitDto(
    val sha: String,
    val parsedMessage: ParsedCommitMessageDto,
    val authorName: String,
    val authorEmail: String?,
    val date: Instant?,
    val htmlUrl: String?,
)
