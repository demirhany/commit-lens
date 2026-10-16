package com.commitlens.commitlensapi.jira.internal.controller

import com.commitlens.commitlensapi.core.model.base.ApiResponse
import com.commitlens.commitlensapi.jira.internal.model.JiraIssueCommitResponseDto
import com.commitlens.commitlensapi.jira.internal.service.JiraService
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
import org.springframework.web.bind.annotation.RestController
import io.swagger.v3.oas.annotations.responses.ApiResponse as OpenApiResponse

@RestController
@RequestMapping("/api/jira")
@Tag(
    name = "Jira Tracing",
    description = "Traces Jira issues to the commits linked through the Atlassian Development Status integration."
)
class JiraController(
    private val jiraService: JiraService
) {
    @GetMapping("/issues/{issueKey}/commits")
    @Cacheable(value = ["jira-commits-cache"], keyGenerator = "userAwareKeyGenerator")
    @Operation(
        summary = "Get commits linked to a Jira issue",
        description = "Fetches the issue summary and every commit linked to it across connected repositories. " +
            "Each commit message is parsed according to the Conventional Commits specification. " +
            "Repositories whose URL cannot be resolved to a supported provider are skipped."
    )
    @ApiResponses(
        OpenApiResponse(responseCode = "200", description = "Issue and linked commits returned successfully."),
        OpenApiResponse(
            responseCode = "400",
            description = "Malformed issue key or Jira integration not configured.",
            content = [Content(schema = Schema(implementation = ApiResponse::class))]
        ),
        OpenApiResponse(
            responseCode = "404",
            description = "Issue not found or not accessible with the configured credentials.",
            content = [Content(schema = Schema(implementation = ApiResponse::class))]
        )
    )
    fun getIssueCommits(
        @Parameter(description = "Jira issue key (PROJECT-NUMBER).", example = "PROJ-123")
        @PathVariable issueKey: String
    ): ApiResponse<JiraIssueCommitResponseDto> {
        val issueCommits = jiraService.getIssueCommits(issueKey)
        return ApiResponse.success(data = issueCommits)
    }
}
