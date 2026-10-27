package com.commitlens.commitlensapi.specification.api

import com.commitlens.commitlensapi.parser.api.dto.CommitPolicyDto

interface CommitSpecificationApi {
    fun getCommitPolicy(profileName: String?): CommitPolicyDto
}