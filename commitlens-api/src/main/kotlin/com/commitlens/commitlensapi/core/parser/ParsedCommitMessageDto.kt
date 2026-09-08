package com.commitlens.commitlensapi.core.parser

data class ParsedCommitMessageDto(
    val rawMessage: String,
    val type: String?,
    val scope: String?,
    val description: String,
    val isBreakingChange: Boolean,
    val isConventional: Boolean,
    val jiraKeys: List<String> = emptyList()
)
