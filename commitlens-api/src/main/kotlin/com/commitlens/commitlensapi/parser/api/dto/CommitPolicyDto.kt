package com.commitlens.commitlensapi.parser.api.dto

import com.commitlens.commitlensapi.parser.api.ScopePolicy

data class CommitPolicyDto(
    val types: List<String> = emptyList(),
    val scopes: List<String> = emptyList(),
    val scopePolicy: ScopePolicy = ScopePolicy.OPTIONAL
) {
    companion object {
        val DEFAULT = CommitPolicyDto(
            types = listOf(
                "feat", "fix", "docs", "style",
                "refactor", "perf", "test", "build",
                "ci", "chore", "revert"
            ),
            scopes = emptyList(),
            scopePolicy = ScopePolicy.OPTIONAL
        )
    }
}