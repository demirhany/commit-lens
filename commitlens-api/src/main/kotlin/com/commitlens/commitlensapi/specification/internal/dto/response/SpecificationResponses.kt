package com.commitlens.commitlensapi.specification.internal.dto.response

import com.commitlens.commitlensapi.specification.internal.entity.CommitSpecification
import com.commitlens.commitlensapi.parser.api.ScopePolicy

data class SpecificationResponse(
    val id: Long,
    val profileName: String,
    val description: String?,
    val types: List<SpecificationTypeResponse>,
    val scopes: List<SpecificationScopeResponse>,
    val scopePolicy: ScopePolicy,
) {
    companion object {
        fun fromEntity(entity: CommitSpecification): SpecificationResponse {
            return SpecificationResponse(
                id = entity.id,
                profileName = entity.profileName,
                description = entity.description,
                types = entity.types.map { type -> SpecificationTypeResponse(type.id, type.name, type.description) },
                scopes = entity.scopes.map { scope ->
                    SpecificationScopeResponse(
                        scope.id, scope.name, scope.description
                    )
                },
                scopePolicy = entity.scopePolicy
            )
        }
    }
}

data class SpecificationScopeResponse(
    val id: Long, val name: String, val description: String?
)

data class SpecificationTypeResponse(
    val id: Long, val name: String, val description: String?
)
