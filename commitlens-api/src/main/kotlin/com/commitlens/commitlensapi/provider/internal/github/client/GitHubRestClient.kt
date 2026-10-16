package com.commitlens.commitlensapi.provider.internal.github.client

import com.commitlens.commitlensapi.provider.internal.github.model.GitHubCommitItemDto
import com.commitlens.commitlensapi.provider.internal.github.model.GitHubRepoDto
import com.commitlens.commitlensapi.provider.internal.github.model.GitHubSearchCommitResponseDto
import com.commitlens.commitlensapi.provider.internal.github.model.GitHubSingleCommitDto
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient

@Component
class GitHubRestClient(
    private val gitHubProperties: GitHubProperties,
) {
    // Initialize the RestClient with the base URL and authorization header
    private val restClient: RestClient = RestClient.builder()
        .baseUrl(gitHubProperties.baseUrl)
        .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer ${gitHubProperties.token}")
        .defaultHeader(HttpHeaders.ACCEPT, "application/vnd.github+json")
        .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
        .build()

    // List the repositories that the authenticated user has access to
    fun getAllUserRepos(): List<GitHubRepoDto> {
        val allRepos = mutableListOf<GitHubRepoDto>()
        var page = 1
        val perPage = 100
        val maxPages = 20
        val typeRef = object : ParameterizedTypeReference<List<GitHubRepoDto>>() {}

        while (page <= maxPages) {
            val pageRepos = try {
                restClient.get()
                    .uri("/user/repos?per_page={perPage}&page={page}&sort=updated", perPage, page)
                    .retrieve()
                    .body(typeRef)
                    ?: emptyList()
            } catch (e: Exception) {
                throw IllegalStateException(
                    "GitHub response body was empty when fetching user repositories on page $page",
                    e
                )
            }

            if (pageRepos.isEmpty()) break
            allRepos.addAll(pageRepos)

            if (pageRepos.size < perPage) break
            page++
        }

        return allRepos
    }

    // Get details of a specific repository by owner and repo name
    fun getRepo(owner: String, repo: String): GitHubRepoDto {
        return restClient.get()
            .uri("/repos/{owner}/{repo}", owner, repo)
            .retrieve()
            .body(GitHubRepoDto::class.java)
            ?: throw IllegalStateException("GitHub response body was empty when fetching repository details for $owner/$repo")
    }

    // Search for commits in a specific repository based on the provided query (including substrings like "Jira key", "feat", etc.)
    fun searchCommits(
        owner: String,
        repo: String,
        query: String,
        page: Int = 1,
        perPage: Int = 100
    ): GitHubSearchCommitResponseDto {
        return restClient.get()
            .uri { uriBuilder ->
                uriBuilder.path("/search/commits")
                    .queryParam("q", "repo:$owner/$repo $query")
                    .queryParam("sort", "committer-date")
                    .queryParam("order", "desc")
                    .queryParam("per_page", perPage)
                    .queryParam("page", page)
                    .build()
            }
            .retrieve()
            // Deserialize the response into a GitHubSearchCommitResponseDto and return the list of commit items in that dto
            .body(GitHubSearchCommitResponseDto::class.java)
            ?: throw IllegalStateException("GitHub search API returned an empty response body for query: '$query'")
    }

    // Get the recent commits from a specific repository, with optional pagination parameters (page and perPage)
    fun getRecentCommits(owner: String, repo: String, page: Int = 1, perPage: Int = 100): List<GitHubCommitItemDto> {
        return restClient.get()
            .uri("/repos/{owner}/{repo}/commits?page={page}&per_page={perPage}", owner, repo, page, perPage)
            .retrieve()
            .body(object : ParameterizedTypeReference<List<GitHubCommitItemDto>>() {})
            ?: throw IllegalStateException("GitHub response body was empty when fetching recent commits in repo: $owner/$repo")
    }

    // Get commit details including stats, file changes, and patches
    fun getCommitDetail(owner: String, repo: String, sha: String): GitHubSingleCommitDto {
        return restClient.get()
            .uri("/repos/{owner}/{repo}/commits/{sha}", owner, repo, sha)
            .retrieve()
            .body(GitHubSingleCommitDto::class.java)
            ?: throw IllegalStateException("GitHub response body was empty for commit: $sha in repo: $owner/$repo")
    }
}
