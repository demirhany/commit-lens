package com.commitlens.commitlensapi.parser.internal.api

import com.commitlens.commitlensapi.parser.api.ScopePolicy
import com.commitlens.commitlensapi.parser.api.dto.CommitPolicyDto
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class CommitParserServiceTest {

    private val parser = CommitParserService()

    // Should parse a standard conventional commit message with type, scope, and description
    @Test
    fun shouldParseStandardConventionalCommit() {
        val commitMessage = "feat(auth): add login endpoint" // Standard conventional commit message with type, scope, and description

        val result = parser.parse(commitMessage)

        assertTrue(result.isConventional)
        assertEquals("feat", result.type)
        assertEquals("auth", result.scope)
        assertEquals("add login endpoint", result.description)
        assertFalse(result.isBreakingChange)
    }

    // Should parse a conventional commit message without a scope
    @Test
    fun shouldParseConventionalCommitWithoutScope() {
        val commitMessage = "fix: handle null pointer exception" // Conventional commit message without a scope

        val result = parser.parse(commitMessage)

        assertTrue(result.isConventional)
        assertEquals("fix", result.type)
        assertNull(result.scope)
        assertEquals("handle null pointer exception", result.description)
        assertFalse(result.isBreakingChange)
    }

    // Should detect a breaking change indicated by a bang (!) in the commit message
    @Test
    fun shouldDetectBreakingChangeWithBang() {
        val commitMessage = "feat(api)!: drop support for v1 endpoints" // Conventional commit message indicating a breaking change with a bang (!)

        val result = parser.parse(commitMessage)

        assertTrue(result.isConventional)
        assertEquals("feat", result.type)
        assertEquals("api", result.scope)
        assertEquals("drop support for v1 endpoints", result.description)
        assertTrue(result.isBreakingChange)
    }

    // Should detect a breaking change indicated in the footer of the commit message
    @Test
    fun shouldDetectBreakingChangeInFooter() {
        val commitMessage = """
            feat(auth): update token format
            
            BREAKING CHANGE: old tokens will no longer be valid
        """.trimIndent() // Conventional commit message indicating a breaking change in the footer

        val result = parser.parse(commitMessage)

        assertTrue(result.isConventional)
        assertEquals("feat", result.type)
        assertEquals("auth", result.scope)
        assertTrue(result.isBreakingChange)
    }

    // Should extract JIRA keys from the commit message
    @Test
    fun shouldExtractJiraKeys() {
        val commitMessage = "fix(CL-102): resolve user lookup error CL-101 PROJ-34 [CL-101]" // Conventional commit message containing JIRA keys

        val result = parser.parse(commitMessage)

        assertEquals(listOf("CL-102", "CL-101", "PROJ-34"), result.jiraKeys)
    }

    // Should handle blank commit messages safely
    @Test
    fun shouldHandleBlankMessageSafely() {
        val blankMessage = "   \n\t "

        val result = parser.parse(blankMessage)

        assertFalse(result.isConventional)
        assertNull(result.type)
        assertNull(result.scope)
        assertEquals("", result.description)
        assertFalse(result.isBreakingChange)
        assertTrue(result.jiraKeys.isEmpty())
    }

    // Should handle non-conventional commit messages
    @Test
    fun shouldHandleNonConventionalCommit() {
        val commitMessage = "Update README.md with setup instructions CL-42" // Non-conventional commit message without type or scope

        val result = parser.parse(commitMessage)

        assertFalse(result.isConventional)
        assertNull(result.type)
        assertNull(result.scope)
        assertEquals("Update README.md with setup instructions CL-42", result.description)
        assertFalse(result.isBreakingChange)
        assertEquals(listOf("CL-42"), result.jiraKeys)
    }

    // Should normalize the scope to lower case in the parsed result
    @Test
    fun shouldNormalizeScopeToLowerCase() {
        val commitMessage = "refactor(CORE): simplify parser logic"

        val result = parser.parse(commitMessage)

        assertTrue(result.isConventional)
        assertEquals("core", result.scope)
    }

    // ── ScopePolicy.REQUIRED Tests ──────────────────────────────────────────

    @Test
    fun `should reject commit when ScopePolicy is REQUIRED and scope is missing`() {
        val policy = CommitPolicyDto(
            types = emptyList(),
            scopes = emptyList(),
            scopePolicy = ScopePolicy.REQUIRED
        )

        val result = parser.parse("feat: add feature without scope", policy)

        assertFalse(result.isConventional)
        assertEquals("feat", result.type)
        assertNull(result.scope)
    }

    @Test
    fun `should accept commit when ScopePolicy is REQUIRED and scope is present with empty allowed scopes`() {
        val policy = CommitPolicyDto(
            types = emptyList(),
            scopes = emptyList(),
            scopePolicy = ScopePolicy.REQUIRED
        )

        val result = parser.parse("feat(api): add feature with any scope", policy)

        assertTrue(result.isConventional)
        assertEquals("api", result.scope)
    }

    @Test
    fun `should accept commit when ScopePolicy is REQUIRED and scope is in allowed scopes`() {
        val policy = CommitPolicyDto(
            types = listOf("feat"),
            scopes = listOf("auth", "billing"),
            scopePolicy = ScopePolicy.REQUIRED
        )

        val result = parser.parse("feat(auth): login integration", policy)

        assertTrue(result.isConventional)
        assertEquals("auth", result.scope)
    }

    @Test
    fun `should reject commit when ScopePolicy is REQUIRED and scope is not in allowed scopes`() {
        val policy = CommitPolicyDto(
            types = listOf("feat"),
            scopes = listOf("auth", "billing"),
            scopePolicy = ScopePolicy.REQUIRED
        )

        val result = parser.parse("feat(unknown): login integration", policy)

        assertFalse(result.isConventional)
        assertEquals("unknown", result.scope)
    }

    // ── ScopePolicy.OPTIONAL Tests ──────────────────────────────────────────

    @Test
    fun `should accept commit when ScopePolicy is OPTIONAL and scope is omitted`() {
        val policy = CommitPolicyDto(
            types = listOf("fix"),
            scopes = listOf("ui", "core"),
            scopePolicy = ScopePolicy.OPTIONAL
        )

        val result = parser.parse("fix: quick bug fix without scope", policy)

        assertTrue(result.isConventional)
        assertNull(result.scope)
    }

    @Test
    fun `should accept commit when ScopePolicy is OPTIONAL and scope is present with empty allowed scopes`() {
        val policy = CommitPolicyDto(
            types = listOf("fix"),
            scopes = emptyList(),
            scopePolicy = ScopePolicy.OPTIONAL
        )

        val result = parser.parse("fix(any): bug fix with any scope", policy)

        assertTrue(result.isConventional)
        assertEquals("any", result.scope)
    }

    @Test
    fun `should accept commit when ScopePolicy is OPTIONAL and scope matches allowed scopes`() {
        val policy = CommitPolicyDto(
            types = listOf("fix"),
            scopes = listOf("ui", "core"),
            scopePolicy = ScopePolicy.OPTIONAL
        )

        val result = parser.parse("fix(ui): button styling fix", policy)

        assertTrue(result.isConventional)
        assertEquals("ui", result.scope)
    }

    @Test
    fun `should reject commit when ScopePolicy is OPTIONAL and scope is not in allowed scopes`() {
        val policy = CommitPolicyDto(
            types = listOf("fix"),
            scopes = listOf("ui", "core"),
            scopePolicy = ScopePolicy.OPTIONAL
        )

        val result = parser.parse("fix(invalid): button styling fix", policy)

        assertFalse(result.isConventional)
        assertEquals("invalid", result.scope)
    }

    // ── ScopePolicy.DISABLED Tests ──────────────────────────────────────────

    @Test
    fun `should accept commit when ScopePolicy is DISABLED and scope is omitted`() {
        val policy = CommitPolicyDto(
            types = listOf("chore"),
            scopes = emptyList(),
            scopePolicy = ScopePolicy.DISABLED
        )

        val result = parser.parse("chore: bump dependency version", policy)

        assertTrue(result.isConventional)
        assertNull(result.scope)
    }

    @Test
    fun `should reject commit when ScopePolicy is DISABLED and scope is provided`() {
        val policy = CommitPolicyDto(
            types = listOf("chore"),
            scopes = emptyList(),
            scopePolicy = ScopePolicy.DISABLED
        )

        val result = parser.parse("chore(deps): bump dependency version", policy)

        assertFalse(result.isConventional)
        assertEquals("deps", result.scope)
    }
}
