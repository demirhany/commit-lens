package com.commitlens.commitlensapi.jira.parser

import com.commitlens.commitlensapi.provider.GitProviderType

data class ResolvedRepoInfoDto (
    val owner: String,
    val repo: String,
    val provider: GitProviderType
)