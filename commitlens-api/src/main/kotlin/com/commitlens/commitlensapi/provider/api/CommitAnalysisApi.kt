package com.commitlens.commitlensapi.provider.api

import com.commitlens.commitlensapi.core.model.UnifiedRepoDto
import com.commitlens.commitlensapi.core.model.commit.parsed.UnifiedCommitSearchResponseDto
import com.commitlens.commitlensapi.core.model.commit.parsed.UnifiedParsedCommitDetailDto

interface CommitAnalysisApi {
    fun getSupportedProviders(): List<GitProviderMetadataDto>
    fun getRepos(provider: GitProviderType): List<UnifiedRepoDto>
    fun getRepo(owner: String, repo: String, provider: GitProviderType): UnifiedRepoDto
    fun searchCommits(owner: String, repo: String, query: String, page: Int = 1, perPage: Int = 100, provider: GitProviderType): UnifiedCommitSearchResponseDto
    fun getCommitDetails(owner: String, repo: String, sha: String, provider: GitProviderType): UnifiedParsedCommitDetailDto
}
