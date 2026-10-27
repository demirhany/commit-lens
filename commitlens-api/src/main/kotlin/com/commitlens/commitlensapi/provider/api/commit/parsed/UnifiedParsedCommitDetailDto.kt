package com.commitlens.commitlensapi.core.model.commit.parsed

import com.commitlens.commitlensapi.core.model.UnifiedFileDiffDto

data class UnifiedParsedCommitDetailDto (
    val parsedCommitDto: UnifiedParsedCommitDto,
    val totalAdditions: Int,
    val totalDeletions: Int,
    val files: List<UnifiedFileDiffDto>
)