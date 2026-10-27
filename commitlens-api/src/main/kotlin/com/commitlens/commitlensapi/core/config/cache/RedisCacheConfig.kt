package com.commitlens.commitlensapi.core.config.cache

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import org.springframework.cache.annotation.CachingConfigurer
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.interceptor.CacheErrorHandler
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.cache.RedisCacheConfiguration
import org.springframework.data.redis.cache.RedisCacheManager
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer
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

            // GitHub Caches
            .withCacheConfiguration("github-repos-cache", cacheConfiguration.entryTtl(Duration.ofHours(1)))
            .withCacheConfiguration("github-repo-cache", cacheConfiguration.entryTtl(Duration.ofHours(1)))
            .withCacheConfiguration("github-recent-commits-cache", cacheConfiguration.entryTtl(Duration.ofMinutes(10)))
            .withCacheConfiguration("github-search-commits-cache", cacheConfiguration.entryTtl(Duration.ofMinutes(10)))

            // Commit SHA's and their details are cached for 24 hours to reduce repeated API calls for the same commit information.
            .withCacheConfiguration("github-commit-detail-cache", cacheConfiguration.entryTtl(Duration.ofHours(24)))

            // Bitbucket Caches
            .withCacheConfiguration("bitbucket-commit-detail-cache", cacheConfiguration.entryTtl(Duration.ofHours(24)))
            .withCacheConfiguration("bitbucket-commit-diffstat-cache", cacheConfiguration.entryTtl(Duration.ofHours(24)))

            // Jira Caches
            .withCacheConfiguration("jira-issue-cache", cacheConfiguration.entryTtl(Duration.ofMinutes(15)))
            .withCacheConfiguration("jira-dev-status-cache", cacheConfiguration.entryTtl(Duration.ofMinutes(10)))
            .build()
    }
}
