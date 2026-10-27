package com.commitlens.commitlensapi.parser.api.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class ParsedCommitMessageDto(
    val rawMessage: String,
    val type: String?,
    val scope: String?,
    val description: String,

    @param:JsonProperty("isBreakingChange")
    @get:JsonProperty("isBreakingChange")
    val isBreakingChange: Boolean,

    @param:JsonProperty("isConventional")
    @get:JsonProperty("isConventional")
    val isConventional: Boolean,

    val jiraKeys: List<String> = emptyList()
)
