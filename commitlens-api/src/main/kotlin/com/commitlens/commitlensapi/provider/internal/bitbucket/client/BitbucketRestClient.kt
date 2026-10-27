package com.commitlens.commitlensapi.provider.internal.bitbucket.client

import com.commitlens.commitlensapi.core.util.logger
import com.commitlens.commitlensapi.provider.internal.bitbucket.model.BitbucketCommitDto
import com.commitlens.commitlensapi.provider.internal.bitbucket.model.BitbucketDiffStatDto
import com.commitlens.commitlensapi.provider.internal.bitbucket.model.BitbucketPagedResponse
import org.springframework.cache.annotation.Cacheable
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import java.net.URI

@Component
class BitbucketRestClient(private val bitbucketProperties: BitbucketProperties) {
    private val log = logger()

    private val restClient: RestClient = RestClient.builder()
        .baseUrl(bitbucketProperties.baseUrl)
        .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer ${bitbucketProperties.token}")
        .defaultHeader(HttpHeaders.ACCEPT, "application/json")
        .build()

    // Get commit details (author, message, date, parents)
    @Cacheable(
        value = ["bitbucket-commit-detail-cache"],
        keyGenerator = "customKeyGenerator",
        unless = "#result == null"
    )
    fun getCommitDetail(owner: String, repo: String, sha: String): BitbucketCommitDto {
        return restClient.get()
            .uri("/repositories/{owner}/{repo}/commit/{sha}", owner, repo, sha)
            .retrieve()
            .body(BitbucketCommitDto::class.java)
            ?: throw IllegalStateException("Bitbucket response body was empty for commit: $sha in repo: $owner/$repo")
    }

    // Get commit file changes, additions, and deletions (diffstat)
    @Cacheable(
        value = ["bitbucket-commit-diffstat-cache"],
        keyGenerator = "customKeyGenerator",
        unless = "#result == null"
    )
    fun getAllCommitDiffStats(owner: String, repo: String, sha: String): List<BitbucketDiffStatDto> {
        val allDiffs = mutableListOf<BitbucketDiffStatDto>()
        var nextUrl: String? = "/repositories/$owner/$repo/diffstat/$sha?pagelen=100"
        var pageCount = 0
        val maxPages = 10

        while (!nextUrl.isNullOrBlank() && pageCount < maxPages) {
            pageCount++
            val typeRef = object : ParameterizedTypeReference<BitbucketPagedResponse<BitbucketDiffStatDto>>() {}

            val response = try {
                if (nextUrl.startsWith("http")) {
                    restClient.get().uri(URI.create(nextUrl)).retrieve().body(typeRef)
                } else {
                    restClient.get().uri(nextUrl).retrieve().body(typeRef)
                }
            } catch (e: Exception) {
                log.error("Bitbucket diffstat page error ($owner/$repo@$sha, page: $pageCount): {}", e.message)
                break
            } ?: break

            allDiffs.addAll(response.values)
            nextUrl = response.next
        }

        return allDiffs
    }
}
