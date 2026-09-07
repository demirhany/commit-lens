package com.commitlens.commitlensapi.provider

import com.commitlens.commitlensapi.core.model.UnifiedRawCommitDto
import com.commitlens.commitlensapi.core.model.UnifiedRepoDto

interface GitProviderStrategy {
    val providerType: GitProviderType

    fun getRepos(): List<UnifiedRepoDto>
    fun getCommits(owner: String, repo: String, query: String? = null): List<UnifiedRawCommitDto>
}