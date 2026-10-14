package com.commitlens.commitlensapi.core.parser.api

interface CommitParserApi {
    fun parse(message: String?): ParsedCommitMessageDto
}
