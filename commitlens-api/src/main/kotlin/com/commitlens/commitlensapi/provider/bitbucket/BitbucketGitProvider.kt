package com.commitlens.commitlensapi.provider.bitbucket

import com.commitlens.commitlensapi.core.model.UnifiedFileDiffDto
import com.commitlens.commitlensapi.core.model.commit.raw.UnifiedRawCommitDetailDto
import com.commitlens.commitlensapi.core.model.commit.raw.UnifiedRawCommitDto
import com.commitlens.commitlensapi.provider.GitProvider
import com.commitlens.commitlensapi.provider.GitProviderType
import com.commitlens.commitlensapi.provider.bitbucket.client.BitbucketRestClient
import com.commitlens.commitlensapi.provider.bitbucket.model.BitbucketAuthorDto
import com.commitlens.commitlensapi.provider.bitbucket.model.BitbucketCommitDto
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

        val files  = diffStats.map { diff ->
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