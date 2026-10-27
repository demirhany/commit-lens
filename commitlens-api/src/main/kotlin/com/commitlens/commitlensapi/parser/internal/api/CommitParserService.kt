package com.commitlens.commitlensapi.parser.internal.api

import com.commitlens.commitlensapi.parser.api.CommitParserApi
import com.commitlens.commitlensapi.parser.api.dto.CommitPolicyDto
import com.commitlens.commitlensapi.parser.api.dto.ParsedCommitMessageDto
import com.commitlens.commitlensapi.parser.api.ScopePolicy
import org.springframework.stereotype.Component

@Component
class CommitParserService
    : CommitParserApi {


    companion object {
        private val CONVENTIONAL_REGEX = Regex("""^([a-zA-Z]+)(?:\(([^)]+)\))?(!)?:\s*(.+)""")
        private val JIRA_REGEX = Regex("""\b([A-Z][A-Z0-9]+-[0-9]+)\b""")
    }

    override fun parse(message: String?): ParsedCommitMessageDto {
        return parse(message, CommitPolicyDto.DEFAULT)
    }

    override fun parse(
        message: String?,
        policy: CommitPolicyDto
    ): ParsedCommitMessageDto {
        if (message.isNullOrBlank()) {
            return ParsedCommitMessageDto(
                rawMessage = message ?: "",
                type = null,
                scope = null,
                description = "",
                isBreakingChange = false,
                isConventional = false,
                jiraKeys = emptyList()
            )
        }

        val trimmed = message.trim()
        val firstLine = trimmed.lines().firstOrNull()?.trim() ?: ""
        val match = CONVENTIONAL_REGEX.find(firstLine)
        val jiraKeys = JIRA_REGEX.findAll(trimmed).map { it.value }.distinct().toList()

        val hasBreakingFooter = trimmed.contains("BREAKING CHANGE:", ignoreCase = true) ||
                trimmed.contains("BREAKING-CHANGE:", ignoreCase = true)

        if (match == null) {
            return ParsedCommitMessageDto(
                rawMessage = message,
                type = null,
                scope = null,
                description = firstLine,
                isBreakingChange = hasBreakingFooter,
                isConventional = false,
                jiraKeys = jiraKeys
            )
        }

        val (rawType, rawScope, breakingBang, rawDescription) = match.destructured
        val sanitizedScope = rawScope.trim().lowercase().ifBlank { null }
        val description = rawDescription.trim()

        val isValidScope = matchScope(sanitizedScope, policy)
        val isValidType = matchType(rawType, policy)
        val hasValidDescription = description.isNotBlank()

        val isConventional = isValidType && isValidScope && hasValidDescription

        return ParsedCommitMessageDto(
            rawMessage = message,
            type = rawType,
            scope = sanitizedScope,
            description = description,
            isBreakingChange = breakingBang.isNotEmpty() || hasBreakingFooter,
            isConventional = isConventional,
            jiraKeys = jiraKeys
        )
    }

    fun matchScope(scope: String?, policy: CommitPolicyDto): Boolean {
        if (policy.scopePolicy == ScopePolicy.REQUIRED && scope.isNullOrBlank()) return false
        if (policy.scopePolicy == ScopePolicy.DISABLED) return scope.isNullOrBlank()

        val isAllowed = policy.scopes.isEmpty() ||
                policy.scopes.any { it.equals(scope, ignoreCase = true) }

        return if (policy.scopePolicy == ScopePolicy.OPTIONAL) {
            scope.isNullOrBlank() || isAllowed
        } else {
            isAllowed
        }
    }

    fun matchType(type: String?, policy: CommitPolicyDto): Boolean {
        return !type.isNullOrBlank() &&
                (policy.types.isEmpty() || policy.types.any { it.equals(type, ignoreCase = true) })
    }
}
