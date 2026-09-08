package com.commitlens.commitlensapi.core.parser

import org.springframework.stereotype.Component

@Component
class ConventionalCommitParser {

    companion object {
        private val CONVENTIONAL_REGEX = Regex("""^([a-zA-Z]+)(?:\(([^)]+)\))?(!)?:\s*(.+)""")
        private val JIRA_REGEX = Regex("""\b([A-Z][A-Z0-9]+-[0-9]+)\b""")
    }

    fun parse(message: String): ParsedCommitMessageDto {
        val trimmed = message.trim()
        val firstLine = trimmed.lines().firstOrNull()?.trim() ?: ""
        val match = CONVENTIONAL_REGEX.find(firstLine)
        val jiraKeys = JIRA_REGEX.findAll(trimmed).map { it.value }.distinct().toList()

        val hasBreakingFooter = trimmed.contains("BREAKING CHANGE:", ignoreCase = true) ||
                trimmed.contains("BREAKING-CHANGE:", ignoreCase = true)

        if (match == null) {
            return ParsedCommitMessageDto(
                rawMessage = trimmed,
                type = null,
                scope = null,
                description = firstLine,
                isBreakingChange = hasBreakingFooter,
                isConventional = false,
                jiraKeys = jiraKeys
            )
        }

        val (type, scope, breakingBang, description) = match.destructured

        return ParsedCommitMessageDto(
            rawMessage = trimmed,
            type = type,
            scope = scope.ifBlank { null }?.lowercase(),
            description = description,
            isBreakingChange = breakingBang.isNotEmpty() || hasBreakingFooter,
            isConventional = true,
            jiraKeys = jiraKeys
        )
    }
}