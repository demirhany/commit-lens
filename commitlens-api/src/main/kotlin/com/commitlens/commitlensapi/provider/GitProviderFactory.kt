package com.commitlens.commitlensapi.provider

import com.commitlens.commitlensapi.exception.UnsupportedProviderException
import org.springframework.stereotype.Component

@Component
class GitProviderFactory(strategies: List<GitProviderStrategy>) {
    private val strategyMap: Map<GitProviderType, GitProviderStrategy> = strategies.associateBy { it.providerType }

    fun getStrategy(providerType: GitProviderType): GitProviderStrategy {
        return strategyMap[providerType]
            ?: throw UnsupportedProviderException("Unsupported Git provider: '$providerType'. Supported providers: ${strategyMap.keys.joinToString()}")
    }
}