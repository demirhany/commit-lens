package com.commitlens.commitlensapi.specification.internal.controller

import com.commitlens.commitlensapi.core.model.base.ApiResponse
import com.commitlens.commitlensapi.specification.internal.dto.request.SpecificationCreateRequest
import com.commitlens.commitlensapi.specification.internal.dto.request.SpecificationUpdateRequest
import com.commitlens.commitlensapi.specification.internal.dto.response.SpecificationResponse
import com.commitlens.commitlensapi.specification.internal.service.SpecificationService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/specifications")
class SpecificationController(
    private val specificationService: SpecificationService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createSpecification(@RequestBody @Valid request: SpecificationCreateRequest): ApiResponse<SpecificationResponse> {
        val result: SpecificationResponse = specificationService.createSpecification(request)
        return ApiResponse.success(
            data = result,
            status = HttpStatus.CREATED.value(),
            message = "Specification created successfully."
        )
    }

    @GetMapping
    fun getSpecifications(): ApiResponse<List<SpecificationResponse>> {
        val specifications: List<SpecificationResponse> = specificationService.getSpecifications()
        return ApiResponse.success(
            data = specifications,
            status = HttpStatus.OK.value(),
            message = "Specifications retrieved successfully."
        )
    }


    @GetMapping("/{id}")
    fun getSpecificationById(@PathVariable id: Long): ApiResponse<SpecificationResponse> {
        val specification: SpecificationResponse = specificationService.getSpecificationById(id)
        return ApiResponse.success(
            data = specification,
            status = HttpStatus.OK.value(),
            message = "Specification retrieved successfully."
        )
    }

    @PutMapping("/{id}")
    fun updateSpecification(
        @PathVariable id: Long,
        @RequestBody @Valid request: SpecificationUpdateRequest
    ): ApiResponse<SpecificationResponse> {
        val specification: SpecificationResponse = specificationService.updateSpecification(id, request)
        return ApiResponse.success(
            data = specification,
            status = HttpStatus.OK.value(),
            message = "Specification updated successfully."
        )
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteSpecification(@PathVariable id: Long) {
        specificationService.deleteSpecification(id)
    }
}
