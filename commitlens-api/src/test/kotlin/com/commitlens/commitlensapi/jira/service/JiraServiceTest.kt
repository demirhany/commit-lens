package com.commitlens.commitlensapi.jira.service

import com.commitlens.commitlensapi.core.parser.ConventionalCommitParser
import com.commitlens.commitlensapi.core.parser.ParsedCommitMessageDto
import com.commitlens.commitlensapi.jira.client.JiraRestClient
import com.commitlens.commitlensapi.jira.model.JiraDevStatusAuthorDto
import com.commitlens.commitlensapi.jira.model.JiraDevStatusCommitDto
import com.commitlens.commitlensapi.jira.model.JiraDevStatusDetailDto
import com.commitlens.commitlensapi.jira.model.JiraDevStatusRepositoryDto
import com.commitlens.commitlensapi.jira.model.JiraDevStatusResponseDto
import com.commitlens.commitlensapi.jira.model.JiraIssueDto
import com.commitlens.commitlensapi.jira.model.JiraIssueFieldsDto
import com.commitlens.commitlensapi.jira.parser.JiraRepoUrlParser
import com.commitlens.commitlensapi.jira.parser.ResolvedRepoInfoDto
import com.commitlens.commitlensapi.provider.GitProviderType
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.Instant
import kotlin.test.assertEquals
import kotlin.test.assertSame
import kotlin.test.assertTrue

class JiraServiceTest {

    private val jiraRestClient: JiraRestClient = mockk()
    private val jiraRepoUrlParser: JiraRepoUrlParser = mockk()
    private val conventionalCommitParser: ConventionalCommitParser = mockk()
    private val jiraService = JiraService(jiraRestClient, jiraRepoUrlParser, conventionalCommitParser)

    private val githubUrl = "https://github.com/acme/app"
    private val parsedMessage = ParsedCommitMessageDto(
        rawMessage = "feat: x",
        type = "feat",
        scope = null,
        description = "x",
        isBreakingChange = false,
        isConventional = true,
        jiraKeys = listOf("PROJ-1")
    )

    private fun commit(id: String, author: JiraDevStatusAuthorDto?, message: String? = "feat: PROJ-1 add x") =
        JiraDevStatusCommitDto(
            id = id,
            displayId = id.take(7),
            message = message,
            author = author,
            authorTimestamp = Instant.parse("2026-02-01T08:00:00Z"),
            url = "$githubUrl/commit/$id"
        )

    private fun stubIssue(vararg repos: JiraDevStatusRepositoryDto, summary: String? = "Add X") {
        every { jiraRestClient.getIssue("PROJ-1") } returns
            JiraIssueDto(id = "10001", key = "PROJ-1", fields = summary?.let { JiraIssueFieldsDto(it) })
        every { jiraRestClient.getDevStatus("10001") } returns
            JiraDevStatusResponseDto(detail = listOf(JiraDevStatusDetailDto(repositories = repos.toList())))
    }

    @BeforeEach
    fun setUp() {
        every { conventionalCommitParser.parse(any()) } returns parsedMessage
        every { jiraRepoUrlParser.parseOrNull(githubUrl) } returns
            ResolvedRepoInfoDto(owner = "acme", repo = "app", provider = GitProviderType.GITHUB)
    }

    /**
     * Covers the happy path: the Jira issue summary and every commit from linked repositories
     * are fetched, parsed and mapped into [com.commitlens.commitlensapi.jira.model.JiraIssueCommitResponseDto].
     */
    @Test
    fun `maps issue summary and linked repository commits into response DTO`() {
        stubIssue(
            JiraDevStatusRepositoryDto(
                name = "acme/app",
                url = githubUrl,
                commits = listOf(
                    commit("1111111aaaa", JiraDevStatusAuthorDto("Jane Doe")),
                    commit("2222222bbbb", JiraDevStatusAuthorDto("John Roe"))
                )
            )
        )

        val result = jiraService.getIssueCommits("PROJ-1")

        assertEquals("PROJ-1", result.issueKey)
        assertEquals("Add X", result.summary)
        assertEquals(2, result.totalCommits)
        val first = result.commits.first()
        assertEquals(GitProviderType.GITHUB, first.provider)
        assertEquals("acme", first.owner)
        assertEquals("app", first.repo)
        assertEquals("acme/app", first.repoName)
        assertEquals("1111111aaaa", first.commit.rawCommitDto.sha)
        assertEquals("Jane Doe", first.commit.rawCommitDto.authorName)
        assertEquals("$githubUrl/commit/1111111aaaa", first.commit.rawCommitDto.htmlUrl)
        assertSame(parsedMessage, first.commit.parsedMessage)
        verify(exactly = 2) { conventionalCommitParser.parse("feat: PROJ-1 add x") }
    }

    /**
     * Ensures that a repository whose URL cannot be resolved to a supported provider is skipped
     * gracefully, while commits from the remaining valid repositories are still returned.
     */
    @Test
    fun `skips repository with unparseable URL without failing`() {
        val badUrl = "https://unknown-host.local/foo"
        every { jiraRepoUrlParser.parseOrNull(badUrl) } returns null
        stubIssue(
            JiraDevStatusRepositoryDto(
                name = "broken", url = badUrl,
                commits = listOf(commit("3333333cccc", JiraDevStatusAuthorDto("X")))
            ),
            JiraDevStatusRepositoryDto(
                name = "acme/app", url = githubUrl,
                commits = listOf(commit("4444444dddd", JiraDevStatusAuthorDto("Y")))
            )
        )

        val result = jiraService.getIssueCommits("PROJ-1")

        assertEquals(1, result.totalCommits)
        assertEquals("4444444dddd", result.commits.single().commit.rawCommitDto.sha)
        assertTrue(result.commits.none { it.repoName == "broken" })
    }

    /**
     * Verifies the degenerate case where no repository can be resolved: the service must return
     * an empty commit list (and a fallback summary) instead of throwing.
     */
    @Test
    fun `returns empty commit list when the only repository URL cannot be parsed`() {
        val badUrl = "not-a-url"
        every { jiraRepoUrlParser.parseOrNull(badUrl) } returns null
        stubIssue(
            JiraDevStatusRepositoryDto(name = "broken", url = badUrl, commits = listOf(commit("5555555eeee", null))),
            summary = null
        )

        val result = jiraService.getIssueCommits("PROJ-1")

        assertEquals(0, result.totalCommits)
        assertTrue(result.commits.isEmpty())
        assertEquals("No summary available", result.summary)
        verify(exactly = 0) { conventionalCommitParser.parse(any()) }
    }

    /**
     * Ensures a missing author object or a null author name falls back to "Unknown",
     * so the response never contains a null author for the dashboard to render.
     */
    @Test
    fun `defaults author name to Unknown when author is missing`() {
        stubIssue(
            JiraDevStatusRepositoryDto(
                name = "acme/app",
                url = githubUrl,
                commits = listOf(
                    commit("6666666ffff", author = null),
                    commit("7777777gggg", author = JiraDevStatusAuthorDto(name = null))
                )
            )
        )

        val result = jiraService.getIssueCommits("PROJ-1")

        assertEquals(2, result.totalCommits)
        assertTrue(result.commits.all { it.commit.rawCommitDto.authorName == "Unknown" })
    }
}
