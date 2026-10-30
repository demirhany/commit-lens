package com.commitlens.commitlensapi.provider.api.commit.parsed

data class UnifiedCommitSearchResponseDto (
    val totalCount: Int?,
    val page: Int,
    val perPage: Int,
    val items: List<UnifiedParsedCommitDto>
)