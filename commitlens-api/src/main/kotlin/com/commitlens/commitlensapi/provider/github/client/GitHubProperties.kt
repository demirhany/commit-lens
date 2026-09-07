package com.commitlens.commitlensapi.provider.github.client

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "github")
class GitHubProperties (
    val baseUrl: String = "https://api.github.com",
    val token: String
)