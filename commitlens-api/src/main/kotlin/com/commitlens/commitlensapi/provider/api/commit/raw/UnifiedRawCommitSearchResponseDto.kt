package com.commitlens.commitlensapi.core.model.commit.raw

data class UnifiedRawCommitSearchResponseDto(
    val totalCount: Int?,
    val page: Int,
    val perPage: Int,
    val items: List<UnifiedRawCommitDto>
)