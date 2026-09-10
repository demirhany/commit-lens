package com.commitlens.commitlensapi.api.controller

import com.commitlens.commitlensapi.core.model.UnifiedCommitDetailDto
import com.commitlens.commitlensapi.core.model.UnifiedCommitSearchResponseDto
import com.commitlens.commitlensapi.core.model.UnifiedRepoDto
import com.commitlens.commitlensapi.core.model.base.ApiResponse
import com.commitlens.commitlensapi.provider.GitProviderFactory
import com.commitlens.commitlensapi.provider.GitProviderType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/git-analysis")
class GitAnalysisController(
    private val providerFactory: GitProviderFactory
) {

    // Fetch and return a list of repositories from the specified Git provider (default is GitHub)
    @GetMapping("/repos")
    fun getRepos(
        @RequestParam(defaultValue = "GITHUB") provider: GitProviderType
    ): ApiResponse<List<UnifiedRepoDto>> {
        val repos = providerFactory.getStrategy(provider).getRepos()
        return ApiResponse.success(data = repos)
    }

    // Fetch and return detailed information about a specific repository from the specified Git provider (default is GitHub)
    @GetMapping("/repos/{owner}/{repo}")
    fun getRepo(
        @PathVariable owner: String,
        @PathVariable repo: String,
        @RequestParam(defaultValue = "GITHUB") provider: GitProviderType
    ): ApiResponse<UnifiedRepoDto> {
        val repoDetails = providerFactory.getStrategy(provider).getRepo(owner, repo)
        return ApiResponse.success(data = repoDetails)
    }

    // Search for commits in a specific repository of the specified Git provider (default is GitHub)
    @GetMapping("/repos/{owner}/{repo}/commits")
    fun searchCommits(
        @PathVariable owner: String,
        @PathVariable repo: String,
        @RequestParam query: String,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "100") perPage: Int,
//        @RequestParam(defaultValue = "300") limit: Int,
        @RequestParam(defaultValue = "GITHUB") provider: GitProviderType
    ): ApiResponse<UnifiedCommitSearchResponseDto> {
        val searchResult = providerFactory.getStrategy(provider).searchCommits(owner, repo, query, page, perPage)
        return ApiResponse.success(data = searchResult)
    }

    // Fetch and return detailed information about a specific commit in a repository of the specified Git provider (default is GitHub)
    @GetMapping("/repos/{owner}/{repo}/commits/{sha}")
    fun getCommitDetails(
        @PathVariable owner: String,
        @PathVariable repo: String,
        @PathVariable sha: String,
        @RequestParam(defaultValue = "GITHUB") provider: GitProviderType
    ): ApiResponse<UnifiedCommitDetailDto> {
        val commitDetails = providerFactory.getStrategy(provider).getCommitDetails(owner, repo, sha)
        return ApiResponse.success(data = commitDetails)
    }
}
