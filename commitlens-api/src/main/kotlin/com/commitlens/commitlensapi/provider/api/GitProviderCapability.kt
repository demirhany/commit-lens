package com.commitlens.commitlensapi.provider.api

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
