package com.commitlens.commitlensapi.provider

import com.commitlens.commitlensapi.core.model.UnifiedCommitDetailDto
import com.commitlens.commitlensapi.core.model.UnifiedRawCommitDto
import com.commitlens.commitlensapi.core.model.UnifiedRepoDto

interface GitProviderStrategy {
    val providerType: GitProviderType

    fun getRepos(): List<UnifiedRepoDto>
    fun searchCommits(owner: String, repo: String, query: String): List<UnifiedRawCommitDto>
    fun getCommitDetails(owner: String, repo: String, sha: String): UnifiedCommitDetailDto
}