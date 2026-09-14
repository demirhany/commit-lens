package com.commitlens.commitlensapi.provider.bitbucket.client

import com.commitlens.commitlensapi.provider.bitbucket.model.BitbucketCommitDto
import com.commitlens.commitlensapi.provider.bitbucket.model.BitbucketDiffStatDto
import com.commitlens.commitlensapi.provider.bitbucket.model.BitbucketPagedResponse
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient

@Component
class BitbucketRestClient (private val bitbucketProperties: BitbucketProperties) {
    private val restClient: RestClient = RestClient.builder()
        .baseUrl(bitbucketProperties.baseUrl)
        .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer ${bitbucketProperties.token}")
        .defaultHeader(HttpHeaders.ACCEPT, "application/json")
        .build()

    // Get commit details (author, message, date, parents)
    fun getCommitDetail(owner: String, repo: String, sha: String): BitbucketCommitDto {
        return restClient.get()
            .uri("/repositories/{owner}/{repo}/commit/{sha}", owner, repo, sha)
            .retrieve()
            .body(BitbucketCommitDto::class.java)
            ?: throw IllegalStateException("Bitbucket response body was empty for commit: $sha in repo: $owner/$repo")
    }

    // Get commit file changes, additions, and deletions (diffstat)
    fun getCommitDiffStat(owner: String, repo: String, sha: String): BitbucketPagedResponse<BitbucketDiffStatDto> {
        return restClient.get()
            .uri("/repositories/{owner}/{repo}/diffstat/{sha}?pagelen=100", owner, repo, sha)
            .retrieve()
            .body(object : ParameterizedTypeReference<BitbucketPagedResponse<BitbucketDiffStatDto>>() {})
            ?: throw IllegalStateException("Bitbucket response body was empty when fetching diffstat for commit: $sha in repo: $owner/$repo")
    }
}