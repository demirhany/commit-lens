package com.commitlens.commitlensapi.specification.internal.dto.request

import com.commitlens.commitlensapi.parser.api.ScopePolicy
import jakarta.validation.Valid
import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Size

data class SpecificationCreateRequest(
    @field:NotBlank(message = "Profile name must not be blank")
    @field:Size(max = 50, message = "Profile name must not exceed 50 characters")
    val profileName: String,
    @field:Size(max = 255, message = "Description must not exceed 255 characters")
    val description: String?,

    @field:NotEmpty(message = "At least one type must be provided")
    @field:Valid
    val types: List<SpecificationTypeRequest>,

    @field:Valid
    val scopes: List<SpecificationScopeRequest>?,
    val scopePolicy: ScopePolicy
) {
    @get:AssertTrue(message = "Scopes must be provided when scopePolicy is REQUIRED")
    val isRequiredScopesValid: Boolean
        get() = if (scopePolicy == ScopePolicy.REQUIRED) !scopes.isNullOrEmpty() else true

    @get:AssertTrue(message = "Scopes must not be provided when scopePolicy is DISABLED")
    val isDisabledScopesValid: Boolean
        get() = if (scopePolicy == ScopePolicy.DISABLED) scopes.isNullOrEmpty() else true

    @get:AssertTrue(message = "types must not contain duplicate names")
    val isTypesUnique: Boolean
        get() = types.map { it.name }.distinct().size == types.size

    @get:AssertTrue(message = "scopes must not contain duplicate names")
    val isScopesUnique: Boolean
        get() = scopes?.let { list -> list.map { it.name }.distinct().size == list.size } ?: true
}

data class SpecificationUpdateRequest(
    @field:NotBlank(message = "Profile name must not be blank")
    @field:Size(max = 50, message = "Profile name must not exceed 50 characters")
    val profileName: String,
    @field:Size(max = 255, message = "Description must not exceed 255 characters")
    val description: String?,

    @field:NotEmpty(message = "At least one type must be provided")
    @field:Valid
    val types: List<SpecificationTypeRequest>,

    @field:Valid
    val scopes: List<SpecificationScopeRequest>?,
    val scopePolicy: ScopePolicy
) {
    @get:AssertTrue(message = "Scopes must be provided when scopePolicy is REQUIRED")
    val isRequiredScopesValid: Boolean
        get() = if (scopePolicy == ScopePolicy.REQUIRED) !scopes.isNullOrEmpty() else true

    @get:AssertTrue(message = "Scopes must not be provided when scopePolicy is DISABLED")
    val isDisabledScopesValid: Boolean
        get() = if (scopePolicy == ScopePolicy.DISABLED) scopes.isNullOrEmpty() else true

    @get:AssertTrue(message = "types must not contain duplicate names")
    val isTypesUnique: Boolean
        get() = types.map { it.name }.distinct().size == types.size

    @get:AssertTrue(message = "scopes must not contain duplicate names")
    val isScopesUnique: Boolean
        get() = scopes?.let { list -> list.map { it.name }.distinct().size == list.size } ?: true
}

data class SpecificationScopeRequest(
    @field:NotBlank(message = "Scope name must not be blank")
    @field:Size(max = 50, message = "Scope name must not exceed 50 characters")
    val name: String,
    @field:Size(max = 255, message = "Scope description must not exceed 255 characters")
    val description: String?
)

data class SpecificationTypeRequest(
    @field:NotBlank(message = "Type name must not be blank")
    @field:Size(max = 50, message = "Type name must not exceed 50 characters")
    val name: String,
    @field:Size(max = 255, message = "Type description must not exceed 255 characters")
    val description: String?
)
