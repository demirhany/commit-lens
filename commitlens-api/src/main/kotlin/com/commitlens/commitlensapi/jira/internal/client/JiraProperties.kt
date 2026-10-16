package com.commitlens.commitlensapi.jira.internal.client

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "jira")
data class JiraProperties(
    val baseUrl: String = "",
    val email: String = "",
    val token: String = "",
)
