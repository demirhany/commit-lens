package com.commitlens.commitlensapi.core.model

data class UnifiedFileDiffDto(
    val filename: String,
    val status: String,
    val additions: Int,
    val deletions: Int,
    val changes: Int,
//    val patch: String?
)