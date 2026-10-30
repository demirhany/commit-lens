package com.commitlens.commitlensapi.core.config.cache

import org.springframework.cache.interceptor.KeyGenerator
import org.springframework.stereotype.Component
import java.lang.reflect.Method
import java.security.MessageDigest

@Component("customKeyGenerator")
class CustomKeyGenerator : KeyGenerator {
    override fun generate(
        target: Any,
        method: Method,
        vararg params: Any?
    ): Any {
        // Generate a unique key based on the user ID, method name, and parameters.
        val canonicalParams = method.parameters.indices
            .map { index ->
                val paramName = method.parameters[index].name
                val paramValue = params.getOrNull(index)?.toString() ?: "null"
                "$paramName=$paramValue"
            }
            .sorted() // Alphabetically sorted: [owner=..., page=..., perPage=..., query=..., repo=...]
            .joinToString("&") // e.g.: owner=example_owner&page=1&perPage=100&provider=GITHUB&query=feat&repo=commitlens

        // Use MD5 hashing to create a fixed-length representation of the parameters to avoid excessively long cache keys.
        val paramsHash = md5(canonicalParams)
        val className = target::class.java.simpleName.substringBefore("$") // Remove any trailing '$' for Kotlin classes

        return "commitlens:$className:${method.name}:$paramsHash"
    }

    // Helper function to compute the MD5 hash of a string.
    private fun md5(input: String): String {
        val digest = MessageDigest.getInstance("MD5").digest(input.toByteArray())
        return digest.joinToString("") { "%02x".format(it) }
    }
}
