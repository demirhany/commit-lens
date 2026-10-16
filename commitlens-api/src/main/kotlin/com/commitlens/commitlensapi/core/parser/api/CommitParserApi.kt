package com.commitlens.commitlensapi.core.parser.api

/**
 * CommitParserApi defines the contract for parsing commit messages.
 * Implementations of this interface should provide the logic to parse
 * commit messages and return a ParsedCommitMessageDto.
 */
interface CommitParserApi {
    fun parse(message: String?): ParsedCommitMessageDto
}
