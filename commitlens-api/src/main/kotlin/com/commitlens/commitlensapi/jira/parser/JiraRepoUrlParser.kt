package com.commitlens.commitlensapi.jira.parser

import com.commitlens.commitlensapi.exception.UnsupportedProviderException
import com.commitlens.commitlensapi.provider.GitProviderType
import org.springframework.stereotype.Component

@Component
class JiraRepoUrlParser {

    // Parse a repository URL and return a ResolvedRepoInfoDto object if successful, or null if the URL is invalid or unsupported.
    fun parseOrNull(repoUrl: String): ResolvedRepoInfoDto? {
        return try {
            val cleanUrl = repoUrl.trim()
            val withoutProtocol = cleanUrl.substringAfter("://")
            val host = withoutProtocol.substringBefore("/").lowercase()
            val path = withoutProtocol.substringAfter("/", "").trim('/')

            val pathSegments = path.split('/').filter { it.isNotBlank() }

            if (pathSegments.size < 2) {
               return null
            }

            val owner = pathSegments[0]
            val repo = pathSegments[1].removeSuffix(".git")

            // Determine the Git provider based on the host
            val provider = when {
                host.contains("bitbucket.org") -> GitProviderType.BITBUCKET
                host.contains("github.com") -> GitProviderType.GITHUB
                else -> throw UnsupportedProviderException("Unsupported Git provider for host: '$host'. Supported providers: ${GitProviderType.entries.joinToString()}")
            }
            ResolvedRepoInfoDto(owner, repo, provider)
        } catch (e: Exception) {
            null
        }
    }
}
