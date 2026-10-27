package com.commitlens.commitlensapi.provider.api.commit.raw

import com.commitlens.commitlensapi.provider.api.UnifiedFileDiffDto

data class UnifiedRawCommitDetailDto(
    val rawCommitDto : UnifiedRawCommitDto,
    val totalAdditions: Int,
    val totalDeletions: Int,
    val files: List<UnifiedFileDiffDto>
)