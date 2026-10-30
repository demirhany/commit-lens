package com.commitlens.commitlensapi.specification.internal.controller

import com.commitlens.commitlensapi.core.exception.GlobalExceptionHandler
import com.commitlens.commitlensapi.parser.api.ScopePolicy
import com.commitlens.commitlensapi.specification.internal.dto.response.SpecificationResponse
import com.commitlens.commitlensapi.specification.internal.dto.response.SpecificationScopeResponse
import com.commitlens.commitlensapi.specification.internal.dto.response.SpecificationTypeResponse
import com.commitlens.commitlensapi.specification.internal.service.SpecificationService
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean

class SpecificationControllerTest {

    private val specificationService: SpecificationService = mockk()
    private val controller = SpecificationController(specificationService)

    private lateinit var mockMvc: MockMvc

    @BeforeEach
    fun setUp() {
        clearAllMocks()
        val validator = LocalValidatorFactoryBean().apply { afterPropertiesSet() }
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
            .setControllerAdvice(GlobalExceptionHandler())
            .setValidator(validator)
            .build()
    }

    private fun sampleResponse(
        id: Long = 1L,
        profileName: String = "default-profile",
        scopePolicy: ScopePolicy = ScopePolicy.OPTIONAL
    ) = SpecificationResponse(
        id = id,
        profileName = profileName,
        description = "Sample description",
        types = listOf(SpecificationTypeResponse(10L, "feat", "Features")),
        scopes = listOf(SpecificationScopeResponse(20L, "core", "Core module")),
        scopePolicy = scopePolicy
    )

    @Nested
    inner class CreateSpecificationValidation {

        @Test
        fun `returns 400 Bad Request when profileName is blank`() {
            val jsonPayload = """
                {
                    "profileName": "   ",
                    "description": "Valid description",
                    "types": [{"name": "feat", "description": "Feature"}],
                    "scopes": [],
                    "scopePolicy": "OPTIONAL"
                }
            """.trimIndent()

            mockMvc.perform(
                post("/api/specifications")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonPayload)
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.success").value(false))

            verify(exactly = 0) { specificationService.createSpecification(any()) }
        }

        @Test
        fun `returns 400 Bad Request when types list is empty`() {
            val jsonPayload = """
                {
                    "profileName": "custom-spec",
                    "description": "Valid description",
                    "types": [],
                    "scopes": [],
                    "scopePolicy": "OPTIONAL"
                }
            """.trimIndent()

            mockMvc.perform(
                post("/api/specifications")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonPayload)
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.status").value(400))

            verify(exactly = 0) { specificationService.createSpecification(any()) }
        }

        @Test
        fun `returns 400 Bad Request when type name exceeds 50 characters`() {
            val longName = "a".repeat(51)
            val jsonPayload = """
                {
                    "profileName": "custom-spec",
                    "description": "Valid description",
                    "types": [{"name": "$longName", "description": "Feature"}],
                    "scopes": [],
                    "scopePolicy": "OPTIONAL"
                }
            """.trimIndent()

            mockMvc.perform(
                post("/api/specifications")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonPayload)
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.details[0]").value(org.hamcrest.Matchers.containsString("Type name must not exceed 50 characters")))

            verify(exactly = 0) { specificationService.createSpecification(any()) }
        }

        @Test
        fun `returns 400 Bad Request when scope name exceeds 50 characters`() {
            val longName = "s".repeat(51)
            val jsonPayload = """
                {
                    "profileName": "custom-spec",
                    "description": "Valid description",
                    "types": [{"name": "feat", "description": "Feature"}],
                    "scopes": [{"name": "$longName", "description": "Scope"}],
                    "scopePolicy": "OPTIONAL"
                }
            """.trimIndent()

            mockMvc.perform(
                post("/api/specifications")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonPayload)
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.details[0]").value(org.hamcrest.Matchers.containsString("Scope name must not exceed 50 characters")))

            verify(exactly = 0) { specificationService.createSpecification(any()) }
        }

        @Test
        fun `returns 400 Bad Request when types list contains duplicate names`() {
            val jsonPayload = """
                {
                    "profileName": "custom-spec",
                    "description": "Valid description",
                    "types": [
                        {"name": "feat", "description": "Feature 1"},
                        {"name": "feat", "description": "Feature 2"}
                    ],
                    "scopes": [],
                    "scopePolicy": "OPTIONAL"
                }
            """.trimIndent()

            mockMvc.perform(
                post("/api/specifications")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonPayload)
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.status").value(400))

            verify(exactly = 0) { specificationService.createSpecification(any()) }
        }

        @Test
        fun `returns 400 Bad Request when scopePolicy is REQUIRED and scopes is empty`() {
            val jsonPayload = """
                {
                    "profileName": "required-scope-spec",
                    "description": "Valid description",
                    "types": [{"name": "feat", "description": "Feature"}],
                    "scopes": [],
                    "scopePolicy": "REQUIRED"
                }
            """.trimIndent()

            mockMvc.perform(
                post("/api/specifications")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonPayload)
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.status").value(400))

            verify(exactly = 0) { specificationService.createSpecification(any()) }
        }

        @Test
        fun `returns 400 Bad Request when scopePolicy is REQUIRED and scopes is null`() {
            val jsonPayload = """
                {
                    "profileName": "required-scope-spec",
                    "description": "Valid description",
                    "types": [{"name": "feat", "description": "Feature"}],
                    "scopes": null,
                    "scopePolicy": "REQUIRED"
                }
            """.trimIndent()

            mockMvc.perform(
                post("/api/specifications")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonPayload)
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.status").value(400))

            verify(exactly = 0) { specificationService.createSpecification(any()) }
        }

        @Test
        fun `returns 400 Bad Request when scopePolicy is DISABLED and scopes is provided`() {
            val jsonPayload = """
                {
                    "profileName": "disabled-scope-spec",
                    "description": "Valid description",
                    "types": [{"name": "feat", "description": "Feature"}],
                    "scopes": [{"name": "scope1", "description": "Not allowed"}],
                    "scopePolicy": "DISABLED"
                }
            """.trimIndent()

            mockMvc.perform(
                post("/api/specifications")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonPayload)
            )
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.status").value(400))

            verify(exactly = 0) { specificationService.createSpecification(any()) }
        }

        @Test
        fun `returns 201 Created when request is valid`() {
            val jsonPayload = """
                {
                    "profileName": "valid-profile",
                    "description": "Valid description",
                    "types": [{"name": "feat", "description": "Feature"}],
                    "scopes": [{"name": "core", "description": "Core"}],
                    "scopePolicy": "OPTIONAL"
                }
            """.trimIndent()

            val responseObj = sampleResponse(id = 100L, profileName = "valid-profile")
            every { specificationService.createSpecification(any()) } returns responseObj

            mockMvc.perform(
                post("/api/specifications")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonPayload)
            )
                .andExpect(status().isCreated)
                .andExpect(jsonPath("$.status").value(201))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(100))
                .andExpect(jsonPath("$.data.profileName").value("valid-profile"))

            verify(exactly = 1) { specificationService.createSpecification(any()) }
        }
    }

    @Nested
    inner class DeleteSpecificationEndpoint {

        @Test
        fun `returns 204 No Content when deleting existing specification`() {
            every { specificationService.deleteSpecification(42L) } returns Unit

            mockMvc.perform(
                delete("/api/specifications/42")
            )
                .andExpect(status().isNoContent)

            verify(exactly = 1) { specificationService.deleteSpecification(42L) }
        }
    }

    @Nested
    inner class GetSpecificationEndpoints {

        @Test
        fun `returns 200 OK for list of specifications`() {
            val list = listOf(sampleResponse(1L, "p1"), sampleResponse(2L, "p2"))
            every { specificationService.getSpecifications() } returns list

            mockMvc.perform(get("/api/specifications"))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.length()").value(2))
        }

        @Test
        fun `returns 200 OK for specification by id`() {
            val spec = sampleResponse(5L, "p5")
            every { specificationService.getSpecificationById(5L) } returns spec

            mockMvc.perform(get("/api/specifications/5"))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.id").value(5))
        }
    }
}
