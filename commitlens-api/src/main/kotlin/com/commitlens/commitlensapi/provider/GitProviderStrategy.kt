package com.commitlens.commitlensapi.provider

import com.commitlens.commitlensapi.core.model.UnifiedCommitDetailDto
import com.commitlens.commitlensapi.core.model.UnifiedCommitSearchResponseDto
import com.commitlens.commitlensapi.core.model.UnifiedRepoDto

interface GitProviderStrategy {
    val providerType: GitProviderType

    fun getRepos(): List<UnifiedRepoDto>
    fun searchCommits(owner: String, repo: String, query: String, limit: Int = 300): UnifiedCommitSearchResponseDto
    fun getCommitDetails(owner: String, repo: String, sha: String): UnifiedCommitDetailDto
}