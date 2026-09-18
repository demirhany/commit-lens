package com.commitlens.commitlensapi.core.config.cache

import org.springframework.cache.annotation.CachingConfigurer
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.interceptor.CacheErrorHandler
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.cache.RedisCacheConfiguration
import org.springframework.data.redis.cache.RedisCacheManager
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.serializer.RedisSerializationContext
import org.springframework.data.redis.serializer.RedisSerializer
import org.springframework.data.redis.serializer.StringRedisSerializer
import java.time.Duration

@Configuration
@EnableCaching
class RedisCacheConfig(private val customCacheErrorHandler: CustomCacheErrorHandler) : CachingConfigurer {

    override fun errorHandler(): CacheErrorHandler {
        return customCacheErrorHandler
    }

    // Configure Redis cache settings
    @Bean
    fun cacheConfiguration(): RedisCacheConfiguration {
        return RedisCacheConfiguration.defaultCacheConfig()
            // Set the default time-to-live for cache entries to 10 minutes
            .entryTtl(Duration.ofMinutes(10))

            // Disable caching of null values to avoid storing unnecessary entries
            .disableCachingNullValues()

            // Use StringRedisSerializer for serializing cache keys and JSON serializer for cache values
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(StringRedisSerializer())
            )

            // Use JSON serializer for serializing cache values to support complex objects
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(RedisSerializer.json())
            )
    }

    // Create a RedisCacheManager bean
    @Bean
    fun redisCacheManager(
        connectionFactory: RedisConnectionFactory,
        cacheConfiguration: RedisCacheConfiguration
    ): RedisCacheManager {
        return RedisCacheManager.builder(connectionFactory)
            // Set the default cache configuration for all caches managed by this manager
            .cacheDefaults(cacheConfiguration)
            .withCacheConfiguration("repos-cache", cacheConfiguration.entryTtl(Duration.ofHours(1)))
            .withCacheConfiguration("repo-cache", cacheConfiguration.entryTtl(Duration.ofHours(1)))
            .withCacheConfiguration("commit-search-cache", cacheConfiguration.entryTtl(Duration.ofMinutes(10)))
            .withCacheConfiguration("commit-details-cache", cacheConfiguration.entryTtl(Duration.ofHours(24)))
            .withCacheConfiguration("jira-commits-cache", cacheConfiguration.entryTtl(Duration.ofMinutes(10)))
            .build()
    }
}
