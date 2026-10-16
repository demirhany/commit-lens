package com.commitlens.commitlensapi

import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
@ConfigurationPropertiesScan
class CommitlensApiApplication

fun main(args: Array<String>) {
    runApplication<CommitlensApiApplication>(*args)
}
