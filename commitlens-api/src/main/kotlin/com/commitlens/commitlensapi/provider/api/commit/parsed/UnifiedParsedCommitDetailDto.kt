package com.commitlens.commitlensapi.provider.api.commit.parsed

import com.commitlens.commitlensapi.provider.api.UnifiedFileDiffDto

data class UnifiedParsedCommitDetailDto (
    val parsedCommitDto: UnifiedParsedCommitDto,
    val totalAdditions: Int,
    val totalDeletions: Int,
    val files: List<UnifiedFileDiffDto>
)