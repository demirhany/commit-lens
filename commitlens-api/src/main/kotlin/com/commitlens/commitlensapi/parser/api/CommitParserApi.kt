package com.commitlens.commitlensapi.parser.api

import com.commitlens.commitlensapi.parser.api.dto.CommitPolicyDto
import com.commitlens.commitlensapi.parser.api.dto.ParsedCommitMessageDto

/**
 * CommitParserApi defines the contract for parsing commit messages.
 * Implementations of this interface should provide the logic to parse
 * commit messages and return a ParsedCommitMessageDto.
 */
interface CommitParserApi {
    fun parse(message: String?): ParsedCommitMessageDto

    fun parse(message: String?, policy: CommitPolicyDto = CommitPolicyDto.DEFAULT): ParsedCommitMessageDto
}
