package com.commitlens.commitlensapi.provider.internal.github.client

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "github")
data class GitHubProperties(
    val token: String? = null,
    val baseUrl: String = "https://api.github.com"
)
