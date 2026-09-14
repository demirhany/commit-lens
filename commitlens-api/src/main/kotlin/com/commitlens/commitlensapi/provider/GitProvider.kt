package com.commitlens.commitlensapi.provider

import com.commitlens.commitlensapi.core.model.commit.raw.UnifiedRawCommitDetailDto
import com.commitlens.commitlensapi.core.model.UnifiedRepoDto
import com.commitlens.commitlensapi.core.model.commit.raw.UnifiedRawCommitSearchResponseDto
import com.commitlens.commitlensapi.provider.model.GitProviderCapability

interface GitProvider {
    val providerType: GitProviderType

    // This property returns the capabilities of the Git provider strategy. It builds a set of capabilities based on the type of the strategy.
    val capabilities: Set<GitProviderCapability>
        get() = buildSet {
            add(GitProviderCapability.COMMIT_DETAILS)

            if (this@GitProvider is SearchableGitProvider) {
                add(GitProviderCapability.SEARCH_COMMITS)
            }

            if (this@GitProvider is RepositoryAwareGitProvider) {
                add(GitProviderCapability.LIST_REPOSITORIES)
            }
        }

    fun getCommitDetails(owner: String, repo: String, sha: String): UnifiedRawCommitDetailDto
}

// This interface extends GitProviderStrategy and adds a method for searching commits.
interface SearchableGitProvider : GitProvider {
    fun searchCommits(owner: String, repo: String, query: String, page: Int = 1, perPage: Int = 100): UnifiedRawCommitSearchResponseDto
}

// This interface extends GitProviderStrategy and adds methods for fetching repository information.
interface RepositoryAwareGitProvider : GitProvider {
    fun getRepos(): List<UnifiedRepoDto>
    fun getRepo(owner: String, repo: String): UnifiedRepoDto
}