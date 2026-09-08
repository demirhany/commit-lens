package com.commitlens.commitlensapi.provider.github.client

import com.commitlens.commitlensapi.provider.github.model.GitHubCommitItemDto
import com.commitlens.commitlensapi.provider.github.model.GitHubRepoDto
import com.commitlens.commitlensapi.provider.github.model.GitHubSearchCommitResponseDto
import com.commitlens.commitlensapi.provider.github.model.GitHubSingleCommitDto
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import tools.jackson.databind.ObjectMapper

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
    fun getUserRepos(): List<GitHubRepoDto> {
        return restClient.get()
            .uri("/user/repos?per_page=100&sort=updated")
            .retrieve()
            // Deserialize the response into a list of GitHubRepoDto
            .body(object : ParameterizedTypeReference<List<GitHubRepoDto>>() {})
            ?: emptyList()
    }

    // Search for commits in a specific repository based on the provided query (including substrings like "Jira key", "feat", etc.)
    fun searchCommits(owner: String, repo: String, query: String): List<GitHubCommitItemDto> {
        return restClient.get()
            .uri { uriBuilder ->
                uriBuilder.path("/search/commits")
                    .queryParam("q", "repo:$owner/$repo $query")
                    .queryParam("sort", "committer-date")
                    .queryParam("order", "desc")
                    .build()
            }
            .retrieve()
            // Deserialize the response into a GitHubSearchCommitResponseDto and return the list of commit items in that dto
            .body(GitHubSearchCommitResponseDto::class.java)?.items ?: emptyList()
    }

    // Get the recent commits from a specific repository, with optional pagination parameters (page and perPage)
    fun getRecentCommits(owner: String, repo: String, page: Int = 1, perPage: Int = 100): List<GitHubCommitItemDto> {
        return restClient.get()
            .uri("/repos/{owner}/{repo}/commits?page={page}&per_page={perPage}", owner, repo, page, perPage)
            .retrieve()
            .body(object : ParameterizedTypeReference<List<GitHubCommitItemDto>>() {})
            ?: emptyList()
    }

    // Get commit details including stats, file changes, and patches
    fun getCommitDetail(owner: String, repo: String, sha: String): GitHubSingleCommitDto {
        return restClient.get()
            .uri("/repos/{owner}/{repo}/commits/{sha}", owner, repo, sha)
            .retrieve()
            .body(GitHubSingleCommitDto::class.java)
            ?: throw NoSuchElementException("Commit not found: $sha")
    }
}
