package com.commitlens.commitlensapi

import com.commitlens.commitlensapi.provider.bitbucket.client.BitbucketProperties
import com.commitlens.commitlensapi.provider.github.client.GitHubProperties
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication

@SpringBootApplication
@EnableConfigurationProperties(GitHubProperties::class, BitbucketProperties::class)
class CommitlensApiApplication

fun main(args: Array<String>) {
    runApplication<CommitlensApiApplication>(*args)
}
