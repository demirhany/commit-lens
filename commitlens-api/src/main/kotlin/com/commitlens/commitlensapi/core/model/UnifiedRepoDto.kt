package com.commitlens.commitlensapi.core.model

import com.fasterxml.jackson.annotation.JsonProperty

data class UnifiedRepoDto(
    val id: String,
    val name: String,
    val fullName: String,
    val owner: String,
    val defaultBranch: String,

    @param:JsonProperty("isPrivate")
    @get:JsonProperty("isPrivate")
    val isPrivate: Boolean,
    val htmlUrl: String,
)
