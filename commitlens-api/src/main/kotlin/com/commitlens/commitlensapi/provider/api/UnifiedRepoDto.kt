package com.commitlens.commitlensapi.provider.api

data class UnifiedRepoDto(
    val id: String,
    val name: String,
    val fullName: String,
    val owner: String,
    val defaultBranch: String,
    val isPrivate: Boolean,
    val htmlUrl: String,
)
