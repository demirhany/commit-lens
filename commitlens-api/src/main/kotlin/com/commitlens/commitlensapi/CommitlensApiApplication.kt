package com.commitlens.commitlensapi

import com.commitlens.commitlensapi.jira.internal.client.JiraProperties
import com.commitlens.commitlensapi.provider.internal.bitbucket.client.BitbucketProperties
import com.commitlens.commitlensapi.provider.internal.github.client.GitHubProperties
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication

@SpringBootApplication
@EnableConfigurationProperties(
    GitHubProperties::class,
    JiraProperties::class,
    BitbucketProperties::class
)
class CommitlensApiApplication

fun main(args: Array<String>) {
    runApplication<CommitlensApiApplication>(*args)
}
