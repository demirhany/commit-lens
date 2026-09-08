package com.commitlens.commitlensapi.core.model

data class UnifiedCommitSearchResponseDto (
    val totalCount: Int,
    val limit: Int,
    val items: List<UnifiedRawCommitDto>
)