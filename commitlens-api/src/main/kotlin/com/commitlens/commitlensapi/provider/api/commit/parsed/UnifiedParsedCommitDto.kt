package com.commitlens.commitlensapi.provider.api.commit.parsed

import com.commitlens.commitlensapi.provider.api.commit.raw.UnifiedRawCommitDto
import com.commitlens.commitlensapi.parser.api.dto.ParsedCommitMessageDto

data class UnifiedParsedCommitDto (
    val rawCommitDto: UnifiedRawCommitDto,
    val parsedMessage: ParsedCommitMessageDto?,
)