package com.commitlens.commitlensapi.provider.internal.controller

import com.commitlens.commitlensapi.core.model.UnifiedRepoDto
import com.commitlens.commitlensapi.core.model.base.ApiResponse
import com.commitlens.commitlensapi.core.model.commit.parsed.UnifiedCommitSearchResponseDto
import com.commitlens.commitlensapi.core.model.commit.parsed.UnifiedParsedCommitDetailDto
import com.commitlens.commitlensapi.provider.api.CommitAnalysisApi
import com.commitlens.commitlensapi.provider.api.GitProviderMetadataDto
import com.commitlens.commitlensapi.provider.api.GitProviderType
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.cache.annotation.Cacheable
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import io.swagger.v3.oas.annotations.responses.ApiResponse as OpenApiResponse

@RestController
@RequestMapping("/api/git-analysis")
@Tag(
    name = "Git Analysis",
    description = "Provider-agnostic repository browsing, commit search and Conventional Commits analysis."
)
class GitAnalysisController(
    private val commitAnalysisApi: CommitAnalysisApi
) {
    @GetMapping("/providers")
    @Operation(
        summary = "List supported Git providers",
        description = "Returns every registered Git provider together with the capabilities it supports " +
            "(COMMIT_DETAILS, SEARCH_COMMITS, LIST_REPOSITORIES)."
    )
    @ApiResponses(
        OpenApiResponse(responseCode = "200", description = "Providers listed successfully."),
        OpenApiResponse(
            responseCode = "404",
            description = "Supported providers could not be retrieved.",
            content = [Content(schema = Schema(implementation = ApiResponse::class))]
        )
    )
    fun getSupportedProviders(): ApiResponse<List<GitProviderMetadataDto>> {
        val supportedProviders = commitAnalysisApi.getSupportedProviders()
        return ApiResponse.success(data = supportedProviders)
    }

    // Fetch and return a list of repositories from the specified Git provider (default is GitHub)
    @GetMapping("/repos")
    @Cacheable(value = ["repos-cache"], keyGenerator = "userAwareKeyGenerator")
    @Operation(
        summary = "List repositories",
        description = "Lists repositories accessible with the configured token of the selected provider. " +
            "Only available for providers with the LIST_REPOSITORIES capability."
    )
    @ApiResponses(
        OpenApiResponse(responseCode = "200", description = "Repositories listed successfully."),
        OpenApiResponse(
            responseCode = "400",
            description = "Unsupported provider or provider does not support listing repositories.",
            content = [Content(schema = Schema(implementation = ApiResponse::class))]
        )
    )
    fun getRepos(
        @Parameter(description = "Git provider to query.", example = "GITHUB")
        @RequestParam(defaultValue = "GITHUB") provider: GitProviderType
    ): ApiResponse<List<UnifiedRepoDto>> {
        val repos = commitAnalysisApi.getRepos(provider)
        return ApiResponse.success(data = repos)
    }

    // Fetch and return detailed information about a specific repository from the specified Git provider (default is GitHub)
    @GetMapping("/repos/{owner}/{repo}")
    @Cacheable(value = ["repo-cache"], keyGenerator = "userAwareKeyGenerator")
    @Operation(
        summary = "Get repository details",
        description = "Returns metadata (default branch, visibility, URL) for a single repository."
    )
    @ApiResponses(
        OpenApiResponse(responseCode = "200", description = "Repository found."),
        OpenApiResponse(
            responseCode = "400",
            description = "Unsupported provider or capability not supported.",
            content = [Content(schema = Schema(implementation = ApiResponse::class))]
        ),
        OpenApiResponse(
            responseCode = "404",
            description = "Repository not found or not accessible with the configured token.",
            content = [Content(schema = Schema(implementation = ApiResponse::class))]
        )
    )
    fun getRepo(
        @Parameter(description = "Repository owner (user, organization or Bitbucket workspace).", example = "spring-projects")
        @PathVariable owner: String,
        @Parameter(description = "Repository name (slug).", example = "spring-boot")
        @PathVariable repo: String,
        @Parameter(description = "Git provider to query.", example = "GITHUB")
        @RequestParam(defaultValue = "GITHUB") provider: GitProviderType
    ): ApiResponse<UnifiedRepoDto> {
        val repoDetails = commitAnalysisApi.getRepo(owner, repo, provider)
        return ApiResponse.success(data = repoDetails)
    }

    // Search for commits in a specific repository of the specified Git provider (default is GitHub)
    @GetMapping("/repos/{owner}/{repo}/commits")
    @Cacheable(value = ["commit-search-cache"], keyGenerator = "userAwareKeyGenerator")
    @Operation(
        summary = "Search commits",
        description = "Searches commits in a repository and parses every message according to the " +
            "Conventional Commits specification (type, scope, breaking change, Jira keys)."
    )
    @ApiResponses(
        OpenApiResponse(responseCode = "200", description = "Search completed successfully."),
        OpenApiResponse(
            responseCode = "400",
            description = "Blank query, invalid pagination (page < 1, perPage outside 1..100) or capability not supported.",
            content = [Content(schema = Schema(implementation = ApiResponse::class))]
        ),
        OpenApiResponse(
            responseCode = "404",
            description = "Repository not found.",
            content = [Content(schema = Schema(implementation = ApiResponse::class))]
        )
    )
    fun searchCommits(
        @Parameter(description = "Repository owner.", example = "spring-projects")
        @PathVariable owner: String,
        @Parameter(description = "Repository name (slug).", example = "spring-boot")
        @PathVariable repo: String,
        @Parameter(description = "Free-text search query applied to commit messages. Must not be blank.", example = "fix")
        @RequestParam query: String,
        @Parameter(description = "1-based page number.", example = "1")
        @RequestParam(defaultValue = "1") page: Int,
        @Parameter(description = "Page size (1-100).", example = "100")
        @RequestParam(defaultValue = "100") perPage: Int,
        @Parameter(description = "Git provider to query.", example = "GITHUB")
        @RequestParam(defaultValue = "GITHUB") provider: GitProviderType
    ): ApiResponse<UnifiedCommitSearchResponseDto> {
        val searchResult = commitAnalysisApi.searchCommits(owner, repo, query, page, perPage, provider)
        return ApiResponse.success(data = searchResult)
    }

    // Fetch and return detailed information about a specific commit in a repository of the specified Git provider (default is GitHub)
    @GetMapping("/repos/{owner}/{repo}/commits/{sha}")
    @Cacheable(value = ["commit-details-cache"], keyGenerator = "userAwareKeyGenerator")
    @Operation(
        summary = "Get commit details",
        description = "Returns a single commit with its parsed Conventional Commit message, " +
            "aggregate additions/deletions and per-file diff statistics."
    )
    @ApiResponses(
        OpenApiResponse(responseCode = "200", description = "Commit found."),
        OpenApiResponse(
            responseCode = "400",
            description = "Blank SHA or unsupported provider.",
            content = [Content(schema = Schema(implementation = ApiResponse::class))]
        ),
        OpenApiResponse(
            responseCode = "404",
            description = "Commit or repository not found.",
            content = [Content(schema = Schema(implementation = ApiResponse::class))]
        )
    )
    fun getCommitDetails(
        @Parameter(description = "Repository owner.", example = "spring-projects")
        @PathVariable owner: String,
        @Parameter(description = "Repository name (slug).", example = "spring-boot")
        @PathVariable repo: String,
        @Parameter(description = "Full or abbreviated commit SHA.", example = "a1b2c3d4e5f6")
        @PathVariable sha: String,
        @Parameter(description = "Git provider to query.", example = "GITHUB")
        @RequestParam(defaultValue = "GITHUB") provider: GitProviderType
    ): ApiResponse<UnifiedParsedCommitDetailDto> {
        val commitDetails = commitAnalysisApi.getCommitDetails(owner, repo, sha, provider)
        return ApiResponse.success(data = commitDetails)
    }
}
