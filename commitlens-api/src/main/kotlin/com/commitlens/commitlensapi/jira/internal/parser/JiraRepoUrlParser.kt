package com.commitlens.commitlensapi.jira.internal.parser

import com.commitlens.commitlensapi.core.exception.UnsupportedProviderException
import com.commitlens.commitlensapi.core.util.logger
import com.commitlens.commitlensapi.provider.api.GitProviderType
import org.springframework.stereotype.Component

@Component
class JiraRepoUrlParser {
    private val log = logger()

    // Parse a repository URL and return a ResolvedRepoInfoDto object if successful, or null if the URL is invalid or unsupported.
    fun parseOrNull(repoUrl: String): ResolvedRepoInfoDto? {
        return try {
            val cleanUrl = repoUrl.trim()
            val withoutProtocol = cleanUrl.substringAfter("://")
            val host = withoutProtocol.substringBefore("/").lowercase()
            val path = withoutProtocol.substringAfter("/", "").trim('/')
            val pathSegments = path.split('/').filter { it.isNotBlank() }

            if (pathSegments.size < 2) {
                log.warn("Invalid repository URL: '$repoUrl'. Expected format: 'https://<host>/<owner>/<repo>'.")
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
            log.error("Error parsing repository URL: '$repoUrl'. Exception: ${e.message}")
            null
        }
    }
}
