package com.commitlens.commitlensapi.provider

import org.springframework.stereotype.Component

@Component
class GitProviderFactory (strategies: List<GitProviderStrategy>) {
    private val strategyMap: Map<GitProviderType, GitProviderStrategy> = strategies.associateBy { it.providerType }

    fun getStrategy(providerType: GitProviderType): GitProviderStrategy {
        return strategyMap[providerType] ?: throw IllegalArgumentException("No strategy found for provider type: $providerType")
    }
}