package com.commitlens.commitlensapi.core.model

data class UnifiedCommitSearchResponseDto (
    val totalCount: Int,
    val page: Int,
    val perPage: Int,
    val items: List<UnifiedRawCommitDto>
)