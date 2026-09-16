package com.commitlens.commitlensapi.api.jira

import com.commitlens.commitlensapi.core.model.base.ApiResponse
import com.commitlens.commitlensapi.jira.model.JiraIssueCommitResponseDto
import com.commitlens.commitlensapi.jira.service.JiraService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/jira")
class JiraController (
    private val jiraService: JiraService
) {

    @GetMapping("/issues/{issueKey}/commits")
    fun getIssueCommits(
        @PathVariable issueKey: String
    ): ApiResponse<JiraIssueCommitResponseDto> {
        val issueCommits = jiraService.getIssueCommits(issueKey)
        return ApiResponse.success(data = issueCommits)
    }
}
