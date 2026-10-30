package com.commitlens.commitlensapi.jira.internal.client

import com.commitlens.commitlensapi.jira.internal.model.JiraDevStatusResponseDto
import com.commitlens.commitlensapi.jira.internal.model.JiraIssueDto
import org.springframework.cache.annotation.Cacheable
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import java.util.Base64

@Component
class JiraRestClient(private val jiraProperties: JiraProperties) {
    private val restClient: RestClient

    init {
        val credentials = "${jiraProperties.email}:${jiraProperties.token}"
        val basicAuthHeader = "Basic " + Base64.getEncoder().encodeToString(credentials.toByteArray())

        this.restClient = RestClient.builder()
            .baseUrl(jiraProperties.baseUrl)
            .defaultHeader(HttpHeaders.AUTHORIZATION, basicAuthHeader)
            .defaultHeader(HttpHeaders.ACCEPT, "application/json")
            .build()
    }

    // Fetch the details of a specific Jira issue by its key (e.g., "PROJ-123") and return the JiraIssueDto containing the issue's summary and other relevant fields.
    @Cacheable(
        value = ["jira-issue-cache"],
        keyGenerator = "customKeyGenerator",
        unless = "#result == null"
    )
    fun getIssue(issueKey: String): JiraIssueDto {
        return restClient.get()
            .uri("/rest/api/2/issue/{issueKey}?fields=summary", issueKey)
            .retrieve()
            .body(JiraIssueDto::class.java)
            ?: throw IllegalStateException("Jira response body was empty when fetching issue details for $issueKey")
    }

    @Cacheable(
        value = ["jira-dev-status-cache"],
        keyGenerator = "customKeyGenerator",
        unless = "#result == null"
    )
    fun getDevStatus(issueId: String, applicationType: String? = null): JiraDevStatusResponseDto {
        return restClient.get()
            .uri { uriBuilder ->
                uriBuilder.path("/rest/dev-status/1.0/issue/detail")
                    .queryParam("issueId", issueId)
                    .queryParam("dataType", "repository")
                    .apply {
                        if (applicationType != null) {
                            queryParam("applicationType", applicationType)
                        }
                    }
                    .build()
            }
            .retrieve()
            .body(JiraDevStatusResponseDto::class.java)
            ?: throw IllegalStateException("Jira response body was empty when fetching development status for issue ID $issueId")
    }
}
