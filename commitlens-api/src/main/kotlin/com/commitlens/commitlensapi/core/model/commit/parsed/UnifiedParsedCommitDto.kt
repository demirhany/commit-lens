package com.commitlens.commitlensapi.core.model.commit.parsed

import com.commitlens.commitlensapi.core.model.commit.raw.UnifiedRawCommitDto
import com.commitlens.commitlensapi.core.parser.api.ParsedCommitMessageDto

data class UnifiedParsedCommitDto (
    val rawCommitDto: UnifiedRawCommitDto,
    val parsedMessage: ParsedCommitMessageDto?,
)