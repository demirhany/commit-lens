package com.commitlens.commitlensapi.core.model.commit.raw

import com.commitlens.commitlensapi.core.model.UnifiedFileDiffDto

data class UnifiedRawCommitDetailDto(
    val rawCommitDto : UnifiedRawCommitDto,
    val totalAdditions: Int,
    val totalDeletions: Int,
    val files: List<UnifiedFileDiffDto>
)