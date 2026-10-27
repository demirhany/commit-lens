package com.commitlens.commitlensapi.core.model.commit.parsed

import com.commitlens.commitlensapi.core.model.commit.raw.UnifiedRawCommitDto
import com.commitlens.commitlensapi.parser.api.dto.ParsedCommitMessageDto

data class UnifiedParsedCommitDto (
    val rawCommitDto: UnifiedRawCommitDto,
    val parsedMessage: ParsedCommitMessageDto?,
)