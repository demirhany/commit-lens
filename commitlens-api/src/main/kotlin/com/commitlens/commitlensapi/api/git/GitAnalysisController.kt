package com.commitlens.commitlensapi.api.git

import com.commitlens.commitlensapi.core.model.commit.parsed.UnifiedCommitSearchResponseDto
import com.commitlens.commitlensapi.core.model.commit.parsed.UnifiedParsedCommitDetailDto
import com.commitlens.commitlensapi.core.model.UnifiedRepoDto
import com.commitlens.commitlensapi.core.model.base.ApiResponse
import com.commitlens.commitlensapi.core.service.CommitService
import com.commitlens.commitlensapi.provider.GitProviderType
import com.commitlens.commitlensapi.provider.model.GitProviderMetadataDto
import org.springframework.cache.annotation.Cacheable
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/git-analysis")
class GitAnalysisController(
    private val commitService: CommitService
) {

    @GetMapping("/providers")
    fun getSupportedProviders(): ApiResponse<List<GitProviderMetadataDto>> {
        val supportedProviders = commitService.getSupportedProviders()
        return ApiResponse.success(data = supportedProviders)
    }

    // Fetch and return a list of repositories from the specified Git provider (default is GitHub)
    @GetMapping("/repos")
    @Cacheable(value = ["repos-cache"], keyGenerator = "userAwareKeyGenerator")
    fun getRepos(
        @RequestParam(defaultValue = "GITHUB") provider: GitProviderType
    ): ApiResponse<List<UnifiedRepoDto>> {
        val repos = commitService.getRepos(provider)
        return ApiResponse.success(data = repos)
    }

    // Fetch and return detailed information about a specific repository from the specified Git provider (default is GitHub)
    @GetMapping("/repos/{owner}/{repo}")
    @Cacheable(value = ["repo-cache"], keyGenerator = "userAwareKeyGenerator")
    fun getRepo(
        @PathVariable owner: String,
        @PathVariable repo: String,
        @RequestParam(defaultValue = "GITHUB") provider: GitProviderType
    ): ApiResponse<UnifiedRepoDto> {
        val repoDetails = commitService.getRepo(owner, repo, provider)
        return ApiResponse.success(data = repoDetails)
    }

    // Search for commits in a specific repository of the specified Git provider (default is GitHub)
    @GetMapping("/repos/{owner}/{repo}/commits")
    @Cacheable(value = ["commit-search-cache"], keyGenerator = "userAwareKeyGenerator")
    fun searchCommits(
        @PathVariable owner: String,
        @PathVariable repo: String,
        @RequestParam query: String,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "100") perPage: Int,
        @RequestParam(defaultValue = "GITHUB") provider: GitProviderType
    ): ApiResponse<UnifiedCommitSearchResponseDto> {
        val searchResult = commitService.searchCommits(owner, repo, query, page, perPage, provider)
        return ApiResponse.success(data = searchResult)
    }

    // Fetch and return detailed information about a specific commit in a repository of the specified Git provider (default is GitHub)
    @GetMapping("/repos/{owner}/{repo}/commits/{sha}")
    @Cacheable(value = ["commit-details-cache"], keyGenerator = "userAwareKeyGenerator")
    fun getCommitDetails(
        @PathVariable owner: String,
        @PathVariable repo: String,
        @PathVariable sha: String,
        @RequestParam(defaultValue = "GITHUB") provider: GitProviderType
    ): ApiResponse<UnifiedParsedCommitDetailDto> {
        val commitDetails = commitService.getCommitDetails(owner, repo, sha, provider)
        return ApiResponse.success(data = commitDetails)
    }
}
