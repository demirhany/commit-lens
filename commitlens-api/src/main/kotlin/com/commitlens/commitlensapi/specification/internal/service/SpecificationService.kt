package com.commitlens.commitlensapi.specification.internal.service

import com.commitlens.commitlensapi.core.exception.ResourceAlreadyExistsException
import com.commitlens.commitlensapi.core.exception.ResourceNotFoundException
import com.commitlens.commitlensapi.specification.internal.dto.request.SpecificationCreateRequest
import com.commitlens.commitlensapi.specification.internal.dto.request.SpecificationUpdateRequest
import com.commitlens.commitlensapi.specification.internal.dto.response.SpecificationResponse
import com.commitlens.commitlensapi.specification.internal.entity.CommitSpecification
import com.commitlens.commitlensapi.specification.internal.entity.SpecificCommitScope
import com.commitlens.commitlensapi.specification.internal.entity.SpecificCommitType
import com.commitlens.commitlensapi.specification.internal.repository.CommitSpecificationRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Service class for managing commit specifications.
 * This class provides methods for creating, reading, updating, and deleting commit specifications.
 */

@Service
@Transactional(readOnly = true)
class SpecificationService(
    private val specificationRepository: CommitSpecificationRepository
) {
    @Transactional
    fun createSpecification(request: SpecificationCreateRequest): SpecificationResponse {
        // Check if a specification with the same profile name already exists for the user
        if (specificationRepository.existsByProfileName(
                request.profileName
            )
        ) throw ResourceAlreadyExistsException("Specification with profile name '${request.profileName}' already exists.")

        val spec = CommitSpecification(
            profileName = request.profileName,
            description = request.description,
            scopePolicy = request.scopePolicy
        )

        // Add types and scopes to the specification
        request.types.forEach { typeRequest ->
            spec.addType(
                SpecificCommitType(
                    name = typeRequest.name, description = typeRequest.description
                )
            )
        }
        request.scopes?.forEach { scopeRequest ->
            spec.addScope(
                SpecificCommitScope(
                    name = scopeRequest.name, description = scopeRequest.description
                )
            )
        }

        // Save the specification to the repository
        val savedSpec = specificationRepository.save(spec)
        return SpecificationResponse.fromEntity(savedSpec)
    }

    fun getSpecifications(): List<SpecificationResponse> {
        // Retrieve all specifications for the user
        val specifications =
            specificationRepository.findAll()
        return specifications.map { SpecificationResponse.fromEntity(it) }
    }

    fun getSpecificationById(id: Long): SpecificationResponse {
        // Retrieve a specific specification by ID for the user
        val spec = specificationRepository.findById(id).orElseThrow { ResourceNotFoundException("Specification with id '$id' not found.") }
        return SpecificationResponse.fromEntity(spec)
    }

    @Transactional
    fun updateSpecification(id: Long, request: SpecificationUpdateRequest): SpecificationResponse {
        // Retrieve the specification by ID and user ID
        val spec = specificationRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Specification with id '$id' not found.") }

        // Check if the profile name is being changed and if the new profile name already exists for the user
        if (spec.profileName != request.profileName && specificationRepository.existsByProfileName(
                request.profileName
            )
        ) throw ResourceAlreadyExistsException("Specification with profile name '${request.profileName}' already exists.")

        spec.profileName = request.profileName
        spec.description = request.description
        spec.scopePolicy = request.scopePolicy

        spec.types.clear()
        spec.scopes.clear()

        specificationRepository.flush()

        request.types.forEach { typeRequest ->
            spec.addType(
                SpecificCommitType(
                    name = typeRequest.name, description = typeRequest.description
                )
            )
        }

        request.scopes?.forEach { scopeRequest ->
            spec.addScope(
                SpecificCommitScope(
                    name = scopeRequest.name, description = scopeRequest.description
                )
            )
        }

        val updatedSpec = specificationRepository.save(spec)
        return SpecificationResponse.fromEntity(updatedSpec)
    }

    @Transactional
    fun deleteSpecification(id: Long) {
        val spec = specificationRepository.findById(id).orElseThrow { ResourceNotFoundException("Specification with id '$id' not found.") }
        specificationRepository.delete(spec)
    }
}
