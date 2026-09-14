package com.commitlens.commitlensapi.provider

import com.commitlens.commitlensapi.exception.UnsupportedProviderException
import org.springframework.stereotype.Component

@Component
class GitProviderFactory(strategies: List<GitProvider>) {
    private val strategyMap: Map<GitProviderType, GitProvider> = strategies.associateBy { it.providerType }

    fun getStrategy(providerType: GitProviderType): GitProvider {
        return strategyMap[providerType]
            ?: throw UnsupportedProviderException("Unsupported Git provider: '$providerType'. Supported providers: ${strategyMap.keys.joinToString()}")
    }
}