package com.commitlens.commitlensapi.specification.internal.api

import com.commitlens.commitlensapi.parser.api.dto.CommitPolicyDto
import com.commitlens.commitlensapi.specification.api.CommitSpecificationApi
import com.commitlens.commitlensapi.specification.internal.repository.CommitSpecificationRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DefaultCommitSpecificationApi(
    private val repository: CommitSpecificationRepository
) : CommitSpecificationApi {

    @Transactional(readOnly = true)
    override fun getCommitPolicy(
        profileName: String?
    ): CommitPolicyDto {
        return profileName
            ?.takeIf { it.isNotBlank() }
            ?.let { name -> repository.findByProfileName(name) }
            ?.let { commitSpecification ->
                CommitPolicyDto(
                    types = commitSpecification.types.map { type -> type.name },
                    scopes = commitSpecification.scopes.map { scope -> scope.name },
                    scopePolicy = commitSpecification.scopePolicy,
                )
            }
            ?: CommitPolicyDto.DEFAULT
    }
}
