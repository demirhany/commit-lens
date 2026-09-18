package com.commitlens.commitlensapi.core.config.cache

import com.commitlens.commitlensapi.core.util.logger
import org.springframework.cache.Cache
import org.springframework.cache.interceptor.CacheErrorHandler
import org.springframework.stereotype.Component
import java.lang.RuntimeException

@Component
class CustomCacheErrorHandler : CacheErrorHandler {
    private val log = logger()

    override fun handleCacheGetError(
        exception: RuntimeException,
        cache: Cache,
        key: Any
    ) {
        log.warn("Redis GET unsuccessful. Cache: '{}', Key: '{}', Hata: {}",
            cache.name, key, exception.message)
    }

    override fun handleCachePutError(
        exception: RuntimeException,
        cache: Cache,
        key: Any,
        value: Any?
    ) {
        log.warn("Redis PUT unsuccessful. Cache: '{}', Key: '{}', Value: {}, Hata: {}",
            cache.name, key, value, exception.message)
    }

    override fun handleCacheEvictError(
        exception: RuntimeException,
        cache: Cache,
        key: Any
    ) {
        log.warn("Redis EVICT unsuccessful. Cache: '{}', Key: '{}', Hata: {}",
            cache.name, key, exception.message)
    }

    override fun handleCacheClearError(exception: RuntimeException, cache: Cache) {
        log.warn("Redis CLEAR unsuccessful. Cache: '{}', Hata: {}", cache.name, exception.message)
    }
}