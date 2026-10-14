package com.commitlens.commitlensapi.provider.internal.service

import com.commitlens.commitlensapi.core.exception.EmptySearchQueryException
import com.commitlens.commitlensapi.core.exception.InvalidRequestParameterException
import com.commitlens.commitlensapi.core.exception.ProviderCapabilityNotSupportedException
import com.commitlens.commitlensapi.core.model.UnifiedFileDiffDto
import com.commitlens.commitlensapi.core.model.UnifiedRepoDto
import com.commitlens.commitlensapi.core.model.commit.raw.UnifiedRawCommitDetailDto
import com.commitlens.commitlensapi.core.model.commit.raw.UnifiedRawCommitDto
import com.commitlens.commitlensapi.core.model.commit.raw.UnifiedRawCommitSearchResponseDto
import com.commitlens.commitlensapi.core.parser.api.CommitParserApi
import com.commitlens.commitlensapi.core.parser.api.ParsedCommitMessageDto
import com.commitlens.commitlensapi.provider.api.GitProviderCapability
import com.commitlens.commitlensapi.provider.api.GitProviderType
import com.commitlens.commitlensapi.provider.internal.strategy.GitProvider
import com.commitlens.commitlensapi.provider.internal.strategy.GitProviderFactory
import com.commitlens.commitlensapi.provider.internal.strategy.RepositoryAwareGitProvider
import com.commitlens.commitlensapi.provider.internal.strategy.SearchableGitProvider
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource
import org.junit.jupiter.params.provider.ValueSource
import java.time.Instant
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertSame

class CommitServiceTest {

    /** A provider supporting every capability (search + repository listing). */
    private interface FullGitProvider : SearchableGitProvider, RepositoryAwareGitProvider

    private val gitProviderFactory: GitProviderFactory = mockk()
    private val commitParserApi: CommitParserApi = mockk()
    private val commitService = CommitService(gitProviderFactory, commitParserApi)

    private fun rawCommit(sha: String = "abc123", message: String? = "feat(api): add endpoint") = UnifiedRawCommitDto(
        sha = sha,
        message = message,
        authorName = "Jane Doe",
        authorEmail = "jane@example.com",
        date = Instant.parse("2026-01-01T10:00:00Z"),
        htmlUrl = "https://github.com/acme/app/commit/$sha"
    )

    private fun parsed(message: String) = ParsedCommitMessageDto(
        rawMessage = message,
        type = "feat",
        scope = "api",
        description = "add endpoint",
        isBreakingChange = false,
        isConventional = true
    )

    @BeforeEach
    fun setUp() = clearAllMocks()

    @Nested
    inner class GetSupportedProviders {

        /**
         * Ensures every [GitProviderType] is exposed with a human-readable display name
         * and the exact capability set advertised by its strategy.
         */
        @Test
        fun `lists every registered provider with its capabilities`() {
            val github = mockk<GitProvider>()
            val bitbucket = mockk<GitProvider>()
            every { github.capabilities } returns setOf(
                GitProviderCapability.COMMIT_DETAILS,
                GitProviderCapability.SEARCH_COMMITS,
                GitProviderCapability.LIST_REPOSITORIES
            )
            every { bitbucket.capabilities } returns setOf(GitProviderCapability.COMMIT_DETAILS)
            every { gitProviderFactory.getStrategy(GitProviderType.GITHUB) } returns github
            every { gitProviderFactory.getStrategy(GitProviderType.BITBUCKET) } returns bitbucket

            val result = commitService.getSupportedProviders()

            assertEquals(GitProviderType.entries.size, result.size)
            val gh = result.single { it.provider == GitProviderType.GITHUB }
            assertEquals("Github", gh.displayName)
            assertEquals(3, gh.capabilities.size)
            val bb = result.single { it.provider == GitProviderType.BITBUCKET }
            assertEquals("Bitbucket", bb.displayName)
            assertEquals(setOf(GitProviderCapability.COMMIT_DETAILS), bb.capabilities)
        }
    }

    @Nested
    inner class GetRepos {

        /**
         * Verifies that repository listing is delegated to providers implementing
         * [RepositoryAwareGitProvider] and their result is returned unchanged.
         */
        @Test
        fun `returns repositories when provider is repository aware`() {
            val provider = mockk<RepositoryAwareGitProvider>()
            val repos = listOf(
                UnifiedRepoDto("1", "app", "acme/app", "acme", "main", false, "https://github.com/acme/app")
            )
            every { provider.getRepos() } returns repos
            every { gitProviderFactory.getStrategy(GitProviderType.GITHUB) } returns provider

            assertEquals(repos, commitService.getRepos(GitProviderType.GITHUB))
            verify(exactly = 1) { provider.getRepos() }
        }

        /**
         * Guards against calling repository listing on providers that lack the
         * LIST_REPOSITORIES capability; a descriptive 400 error must be raised instead.
         */
        @Test
        fun `throws ProviderCapabilityNotSupportedException when provider cannot list repositories`() {
            every { gitProviderFactory.getStrategy(GitProviderType.BITBUCKET) } returns mockk<GitProvider>()

            assertFailsWith<ProviderCapabilityNotSupportedException> {
                commitService.getRepos(GitProviderType.BITBUCKET)
            }
        }
    }

    @Nested
    inner class SearchCommits {

        /**
         * Rejects empty or whitespace-only search queries before any provider call is made,
         * avoiding wasted (and rate-limited) requests to the Git host.
         */
        @ParameterizedTest
        @ValueSource(strings = ["", "   ", "\t\n"])
        fun `throws EmptySearchQueryException for blank query`(query: String) {
            assertFailsWith<EmptySearchQueryException> {
                commitService.searchCommits("acme", "app", query, 1, 10, GitProviderType.GITHUB)
            }
            verify(exactly = 0) { gitProviderFactory.getStrategy(any()) }
        }

        /**
         * Validates pagination bounds (page >= 1, 1 <= perPage <= 100) and ensures
         * invalid combinations fail fast without reaching the provider.
         */
        @ParameterizedTest(name = "page={0}, perPage={1}")
        @CsvSource("0, 10", "-1, 10", "1, 0", "1, -5", "1, 101")
        fun `throws InvalidRequestParameterException for invalid pagination`(page: Int, perPage: Int) {
            assertFailsWith<InvalidRequestParameterException> {
                commitService.searchCommits("acme", "app", "feat", page, perPage, GitProviderType.GITHUB)
            }
            verify(exactly = 0) { gitProviderFactory.getStrategy(any()) }
        }

        /**
         * Ensures that commit search is refused for providers that do not implement
         * [SearchableGitProvider], even when all input parameters are valid.
         */
        @Test
        fun `throws ProviderCapabilityNotSupportedException when provider is not searchable`() {
            every { gitProviderFactory.getStrategy(GitProviderType.BITBUCKET) } returns mockk<GitProvider>()

            assertFailsWith<ProviderCapabilityNotSupportedException> {
                commitService.searchCommits("acme", "app", "feat", 1, 10, GitProviderType.BITBUCKET)
            }
        }

        /**
         * Covers the happy path: raw provider commits are parsed by [CommitParserApi]
         * (null messages are normalised to an empty string) and pagination metadata is preserved.
         */
        @Test
        fun `parses raw commits and returns paginated result`() {
            val provider = mockk<FullGitProvider>()
            val first = rawCommit("sha1", "feat(api): add endpoint")
            val second = rawCommit("sha2", null)
            every { provider.searchCommits("acme", "app", "feat", 2, 50) } returns
                UnifiedRawCommitSearchResponseDto(totalCount = 2, page = 2, perPage = 50, items = listOf(first, second))
            every { gitProviderFactory.getStrategy(GitProviderType.GITHUB) } returns provider
            val parsedFirst = parsed("feat(api): add endpoint")
            val parsedSecond = parsed("")
            every { commitParserApi.parse("feat(api): add endpoint") } returns parsedFirst
            every { commitParserApi.parse("") } returns parsedSecond

            val result = commitService.searchCommits("acme", "app", "feat", 2, 50, GitProviderType.GITHUB)

            assertEquals(2, result.totalCount)
            assertEquals(2, result.page)
            assertEquals(50, result.perPage)
            assertEquals(listOf(first, second), result.items.map { it.rawCommitDto })
            assertSame(parsedFirst, result.items[0].parsedMessage)
            assertSame(parsedSecond, result.items[1].parsedMessage)
            verify(exactly = 1) { commitParserApi.parse("feat(api): add endpoint") }
            verify(exactly = 1) { commitParserApi.parse("") }
        }
    }

    @Nested
    inner class GetCommitDetails {

        /**
         * Rejects blank commit SHAs up front so that no malformed request is sent
         * to the underlying Git provider.
         */
        @ParameterizedTest
        @ValueSource(strings = ["", "  "])
        fun `throws InvalidRequestParameterException for blank sha`(sha: String) {
            assertFailsWith<InvalidRequestParameterException> {
                commitService.getCommitDetails("acme", "app", sha, GitProviderType.GITHUB)
            }
            verify(exactly = 0) { gitProviderFactory.getStrategy(any()) }
        }

        /**
         * Verifies that commit details are enriched with the parsed message while
         * aggregate additions/deletions and per-file diff stats are mapped one-to-one.
         */
        @Test
        fun `maps diff and file statistics for valid sha`() {
            val provider = mockk<GitProvider>()
            val commit = rawCommit("deadbeef")
            val files = listOf(
                UnifiedFileDiffDto("src/App.kt", "modified", 10, 2, 12),
                UnifiedFileDiffDto("README.md", "added", 5, 0, 5)
            )
            every { provider.getCommitDetails("acme", "app", "deadbeef") } returns
                UnifiedRawCommitDetailDto(rawCommitDto = commit, totalAdditions = 15, totalDeletions = 2, files = files)
            every { gitProviderFactory.getStrategy(GitProviderType.GITHUB) } returns provider
            val parsedMessage = parsed(commit.message!!)
            every { commitParserApi.parse(commit.message) } returns parsedMessage

            val result = commitService.getCommitDetails("acme", "app", "deadbeef", GitProviderType.GITHUB)

            assertEquals(commit, result.parsedCommitDto.rawCommitDto)
            assertSame(parsedMessage, result.parsedCommitDto.parsedMessage)
            assertEquals(15, result.totalAdditions)
            assertEquals(2, result.totalDeletions)
            assertEquals(files, result.files)
        }
    }
}
