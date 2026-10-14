package com.commitlens.commitlensapi.provider.internal.strategy

import com.commitlens.commitlensapi.core.exception.UnsupportedProviderException
import com.commitlens.commitlensapi.provider.api.GitProviderType
import org.springframework.stereotype.Component

@Component
class GitProviderFactory(strategies: List<GitProvider>) {
    private val strategyMap: Map<GitProviderType, GitProvider> = strategies.associateBy { it.providerType }

    fun getStrategy(providerType: GitProviderType): GitProvider {
        return strategyMap[providerType]
            ?: throw UnsupportedProviderException("Unsupported Git provider: '$providerType'. Supported providers: ${strategyMap.keys.joinToString()}")
    }
}
