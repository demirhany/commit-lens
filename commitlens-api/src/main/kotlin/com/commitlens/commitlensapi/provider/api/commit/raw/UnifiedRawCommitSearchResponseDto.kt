package com.commitlens.commitlensapi.provider.api.commit.raw

data class UnifiedRawCommitSearchResponseDto(
    val totalCount: Int?,
    val page: Int,
    val perPage: Int,
    val items: List<UnifiedRawCommitDto>
)