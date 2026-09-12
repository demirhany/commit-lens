package com.commitlens.commitlensapi.provider

import com.commitlens.commitlensapi.core.model.commit.raw.UnifiedRawCommitDetailDto
import com.commitlens.commitlensapi.core.model.commit.raw.UnifiedRawCommitDto
import com.commitlens.commitlensapi.core.model.UnifiedRepoDto
import com.commitlens.commitlensapi.core.model.commit.raw.UnifiedRawCommitSearchResponseDto

interface GitProviderStrategy {
    val providerType: GitProviderType

    fun getRepos(): List<UnifiedRepoDto>
    fun getRepo(owner: String, repo: String): UnifiedRepoDto
    fun searchCommits(owner: String, repo: String, query: String, page: Int = 1, perPage: Int = 100): UnifiedRawCommitSearchResponseDto
    fun getCommitDetails(owner: String, repo: String, sha: String): UnifiedRawCommitDetailDto
}