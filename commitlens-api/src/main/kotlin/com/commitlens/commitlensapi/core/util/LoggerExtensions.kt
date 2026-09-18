package com.commitlens.commitlensapi.core.util

import org.slf4j.Logger
import org.slf4j.LoggerFactory

// Extension function to get a logger for any class
// Usage: val log = logger()
inline fun <reified T : Any> T.logger(): Logger =
    LoggerFactory.getLogger(T::class.java)

// In order to use this function, you can call it from any class like this:
// val logger = logger<MyClass>()
inline fun <reified T : Any> logger(): Logger =
    LoggerFactory.getLogger(T::class.java)
