package com.commitlens.commitlensapi.provider.model

import com.commitlens.commitlensapi.provider.GitProviderType

enum class GitProviderCapability {
    COMMIT_DETAILS,
    SEARCH_COMMITS,
    LIST_REPOSITORIES
}

data class GitProviderMetadataDto(
    val provider: GitProviderType,
    val displayName: String,
    val capabilities: Set<GitProviderCapability>
)