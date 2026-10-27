package com.commitlens.commitlensapi.provider.internal.bitbucket

import com.commitlens.commitlensapi.provider.api.UnifiedFileDiffDto
import com.commitlens.commitlensapi.provider.api.commit.raw.UnifiedRawCommitDetailDto
import com.commitlens.commitlensapi.provider.api.commit.raw.UnifiedRawCommitDto
import com.commitlens.commitlensapi.provider.api.GitProviderType
import com.commitlens.commitlensapi.provider.internal.bitbucket.client.BitbucketRestClient
import com.commitlens.commitlensapi.provider.internal.bitbucket.model.BitbucketAuthorDto
import com.commitlens.commitlensapi.provider.internal.bitbucket.model.BitbucketCommitDto
import com.commitlens.commitlensapi.provider.internal.strategy.GitProvider
import org.springframework.stereotype.Component

@Component
class BitbucketGitProvider(
    private val bitbucketRestClient: BitbucketRestClient
) : GitProvider {
    override val providerType = GitProviderType.BITBUCKET

    override fun getCommitDetails(
        owner: String,
        repo: String,
        sha: String
    ): UnifiedRawCommitDetailDto {
        val rawCommit = bitbucketRestClient.getCommitDetail(owner, repo, sha)
        val diffStats = bitbucketRestClient.getAllCommitDiffStats(owner, repo, sha)

        val totalAdditions = diffStats.sumOf { it.linesAdded }
        val totalDeletions = diffStats.sumOf { it.linesRemoved }

        val files = diffStats.map { diff ->
            UnifiedFileDiffDto(
                filename = diff.newFile?.path ?: diff.oldFile?.path ?: "Unknown",
                status = diff.status,
                additions = diff.linesAdded,
                deletions = diff.linesRemoved,
                changes = diff.linesAdded + diff.linesRemoved
            )
        }

        return UnifiedRawCommitDetailDto(
            rawCommitDto = rawCommit.toUnifiedRawCommitDto(),
            totalAdditions = totalAdditions,
            totalDeletions = totalDeletions,
            files = files
        )
    }

    private fun BitbucketCommitDto.toUnifiedRawCommitDto(): UnifiedRawCommitDto {
        val (authorName, authorEmail) = extractAuthorInfo(this.author)
        return UnifiedRawCommitDto(
            sha = this.hash,
            message = this.message,
            authorName = authorName,
            authorEmail = authorEmail,
            date = this.date,
            htmlUrl = this.links.html?.href
        )
    }

    private fun extractAuthorInfo(author: BitbucketAuthorDto): Pair<String, String?> {
        val displayName = author.user?.displayName
        val emailRegex = Regex("<(.*?)>")
        val email = emailRegex.find(author.raw)?.groupValues?.get(1)
        val name = displayName ?: author.raw.substringBefore("<").trim().ifEmpty { author.raw }
        return Pair(name.ifBlank { "Unknown" }, email)
    }
}
