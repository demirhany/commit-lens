package com.commitlens.commitlensapi.core.model

import com.commitlens.commitlensapi.core.parser.ParsedCommitMessageDto
import java.time.Instant

data class UnifiedCommitDetailDto(
    val sha: String,
    val htmlUrl: String?,
    val authorName: String,
    val authorEmail: String?,
    val date: Instant?,
    val parsedMessage: ParsedCommitMessageDto,
    val rawMessage: String?,
    val totalAdditions: Int,
    val totalDeletions: Int,
    val files: List<UnifiedFileDiffDto>
)