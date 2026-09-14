package com.commitlens.commitlensapi.provider.bitbucket.client

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "bitbucket")
data class BitbucketProperties(
    val baseUrl: String = "https://api.bitbucket.org/2.0",
    val token: String,
    val workspace: String
)