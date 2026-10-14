package com.commitlens.commitlensapi.jira.internal.parser

import com.commitlens.commitlensapi.provider.api.GitProviderType

data class ResolvedRepoInfoDto(
    val owner: String,
    val repo: String,
    val provider: GitProviderType
)
