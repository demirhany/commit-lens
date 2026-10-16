package com.commitlens.commitlensapi.core.parser.internal

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class ConventionalCommitParserTest {

    private val parser = ConventionalCommitParser()

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
}
