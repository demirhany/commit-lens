package com.commitlens.commitlensapi.specification.internal.service

import com.commitlens.commitlensapi.core.exception.ResourceAlreadyExistsException
import com.commitlens.commitlensapi.core.exception.ResourceNotFoundException
import com.commitlens.commitlensapi.parser.api.ScopePolicy
import com.commitlens.commitlensapi.specification.internal.dto.request.SpecificationCreateRequest
import com.commitlens.commitlensapi.specification.internal.dto.request.SpecificationScopeRequest
import com.commitlens.commitlensapi.specification.internal.dto.request.SpecificationTypeRequest
import com.commitlens.commitlensapi.specification.internal.dto.request.SpecificationUpdateRequest
import com.commitlens.commitlensapi.specification.internal.entity.CommitSpecification
import com.commitlens.commitlensapi.specification.internal.entity.SpecificCommitScope
import com.commitlens.commitlensapi.specification.internal.entity.SpecificCommitType
import com.commitlens.commitlensapi.specification.internal.repository.CommitSpecificationRepository
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import java.util.Optional
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class SpecificationServiceTest {

    private val repository: CommitSpecificationRepository = mockk()
    private val service = SpecificationService(repository)

    @BeforeEach
    fun setUp() = clearAllMocks()

    private fun sampleEntity(
        id: Long = 1L,
        profileName: String = "default-profile",
        description: String? = "Standard profile",
        scopePolicy: ScopePolicy = ScopePolicy.OPTIONAL
    ): CommitSpecification {
        val spec = CommitSpecification(
            id = id,
            profileName = profileName,
            description = description,
            scopePolicy = scopePolicy
        )
        spec.addType(SpecificCommitType(id = 10L, name = "feat", description = "New features", standard = spec))
        spec.addType(SpecificCommitType(id = 11L, name = "fix", description = "Bug fixes", standard = spec))
        spec.addScope(SpecificCommitScope(id = 20L, name = "core", description = "Core module", standard = spec))
        return spec
    }

    @Nested
    inner class CreateSpecification {

        @Test
        fun `throws ResourceAlreadyExistsException when profileName already exists`() {
            val request = SpecificationCreateRequest(
                profileName = "existing-profile",
                description = "Desc",
                types = listOf(SpecificationTypeRequest(name = "feat", description = null)),
                scopes = emptyList(),
                scopePolicy = ScopePolicy.OPTIONAL
            )

            every { repository.existsByProfileName("existing-profile") } returns true

            val ex = assertFailsWith<ResourceAlreadyExistsException> {
                service.createSpecification(request)
            }

            assertTrue(ex.message.contains("existing-profile"))
            verify(exactly = 0) { repository.save(any()) }
        }

        @Test
        fun `creates and saves specification successfully when profileName is unique`() {
            val request = SpecificationCreateRequest(
                profileName = "new-profile",
                description = "New profile desc",
                types = listOf(
                    SpecificationTypeRequest(name = "feat", description = "Feature"),
                    SpecificationTypeRequest(name = "fix", description = "Fix")
                ),
                scopes = listOf(
                    SpecificationScopeRequest(name = "api", description = "API scope")
                ),
                scopePolicy = ScopePolicy.REQUIRED
            )

            every { repository.existsByProfileName("new-profile") } returns false

            val savedEntity = CommitSpecification(
                id = 42L,
                profileName = request.profileName,
                description = request.description,
                scopePolicy = request.scopePolicy
            ).apply {
                addType(SpecificCommitType(id = 1L, name = "feat", description = "Feature", standard = this))
                addType(SpecificCommitType(id = 2L, name = "fix", description = "Fix", standard = this))
                addScope(SpecificCommitScope(id = 3L, name = "api", description = "API scope", standard = this))
            }

            every { repository.save(any()) } returns savedEntity

            val response = service.createSpecification(request)

            assertEquals(42L, response.id)
            assertEquals("new-profile", response.profileName)
            assertEquals("New profile desc", response.description)
            assertEquals(ScopePolicy.REQUIRED, response.scopePolicy)
            assertEquals(2, response.types.size)
            assertEquals(listOf("feat", "fix"), response.types.map { it.name })
            assertEquals(1, response.scopes.size)
            assertEquals(listOf("api"), response.scopes.map { it.name })

            verify(exactly = 1) { repository.existsByProfileName("new-profile") }
            verify(exactly = 1) { repository.save(any()) }
        }
    }

    @Nested
    inner class GetSpecifications {

        @Test
        fun `returns all specifications mapped to responses`() {
            val entities = listOf(
                sampleEntity(id = 1L, profileName = "profile-1"),
                sampleEntity(id = 2L, profileName = "profile-2")
            )
            every { repository.findAll() } returns entities

            val responses = service.getSpecifications()

            assertEquals(2, responses.size)
            assertEquals("profile-1", responses[0].profileName)
            assertEquals("profile-2", responses[1].profileName)
            verify(exactly = 1) { repository.findAll() }
        }
    }

    @Nested
    inner class GetSpecificationById {

        @Test
        fun `returns specification response when id exists`() {
            val entity = sampleEntity(id = 5L, profileName = "profile-5")
            every { repository.findById(5L) } returns Optional.of(entity)

            val response = service.getSpecificationById(5L)

            assertEquals(5L, response.id)
            assertEquals("profile-5", response.profileName)
            verify(exactly = 1) { repository.findById(5L) }
        }

        @Test
        fun `throws ResourceNotFoundException when id does not exist`() {
            every { repository.findById(999L) } returns Optional.empty()

            val ex = assertFailsWith<ResourceNotFoundException> {
                service.getSpecificationById(999L)
            }

            assertTrue(ex.message.contains("999"))
            verify(exactly = 1) { repository.findById(999L) }
        }
    }

    @Nested
    inner class UpdateSpecification {

        @Test
        fun `throws ResourceNotFoundException when specification id does not exist`() {
            val request = SpecificationUpdateRequest(
                profileName = "updated",
                description = "desc",
                types = listOf(SpecificationTypeRequest(name = "feat", description = null)),
                scopes = emptyList(),
                scopePolicy = ScopePolicy.OPTIONAL
            )
            every { repository.findById(99L) } returns Optional.empty()

            assertFailsWith<ResourceNotFoundException> {
                service.updateSpecification(99L, request)
            }

            verify(exactly = 1) { repository.findById(99L) }
            verify(exactly = 0) { repository.save(any()) }
        }

        @Test
        fun `throws ResourceAlreadyExistsException when new profileName conflicts with existing record`() {
            val existing = sampleEntity(id = 10L, profileName = "old-name")
            val request = SpecificationUpdateRequest(
                profileName = "taken-name",
                description = "desc",
                types = listOf(SpecificationTypeRequest(name = "feat", description = null)),
                scopes = emptyList(),
                scopePolicy = ScopePolicy.OPTIONAL
            )

            every { repository.findById(10L) } returns Optional.of(existing)
            every { repository.existsByProfileName("taken-name") } returns true

            val ex = assertFailsWith<ResourceAlreadyExistsException> {
                service.updateSpecification(10L, request)
            }

            assertTrue(ex.message.contains("taken-name"))
            verify(exactly = 0) { repository.flush() }
            verify(exactly = 0) { repository.save(any()) }
        }

        @Test
        fun `updates specification, clears child collections, flushes and saves`() {
            val existing = sampleEntity(id = 10L, profileName = "current-name")
            val request = SpecificationUpdateRequest(
                profileName = "new-name",
                description = "Updated description",
                types = listOf(
                    SpecificationTypeRequest(name = "docs", description = "Documentation")
                ),
                scopes = listOf(
                    SpecificationScopeRequest(name = "readme", description = "README file")
                ),
                scopePolicy = ScopePolicy.DISABLED
            )

            every { repository.findById(10L) } returns Optional.of(existing)
            every { repository.existsByProfileName("new-name") } returns false
            every { repository.flush() } returns Unit

            val capturedSpec = slot<CommitSpecification>()
            every { repository.save(capture(capturedSpec)) } answers { capturedSpec.captured }

            val response = service.updateSpecification(10L, request)

            assertEquals("new-name", response.profileName)
            assertEquals("Updated description", response.description)
            assertEquals(ScopePolicy.DISABLED, response.scopePolicy)
            assertEquals(1, response.types.size)
            assertEquals("docs", response.types[0].name)
            assertEquals(1, response.scopes.size)
            assertEquals("readme", response.scopes[0].name)

            // Verify flush was called before saving
            verify(exactly = 1) { repository.flush() }
            verify(exactly = 1) { repository.save(existing) }
        }

        @Test
        fun `allows update when profileName is unchanged without checking duplicate`() {
            val existing = sampleEntity(id = 10L, profileName = "same-name")
            val request = SpecificationUpdateRequest(
                profileName = "same-name",
                description = "Updated description only",
                types = listOf(SpecificationTypeRequest(name = "feat", description = null)),
                scopes = emptyList(),
                scopePolicy = ScopePolicy.OPTIONAL
            )

            every { repository.findById(10L) } returns Optional.of(existing)
            every { repository.flush() } returns Unit
            every { repository.save(any()) } answers { firstArg() }

            val response = service.updateSpecification(10L, request)

            assertEquals("same-name", response.profileName)
            assertEquals("Updated description only", response.description)
            verify(exactly = 0) { repository.existsByProfileName(any()) }
            verify(exactly = 1) { repository.flush() }
            verify(exactly = 1) { repository.save(existing) }
        }
    }

    @Nested
    inner class DeleteSpecification {

        @Test
        fun `throws ResourceNotFoundException when deleting non-existent specification`() {
            every { repository.findById(99L) } returns Optional.empty()

            assertFailsWith<ResourceNotFoundException> {
                service.deleteSpecification(99L)
            }

            verify(exactly = 1) { repository.findById(99L) }
            verify(exactly = 0) { repository.delete(any()) }
        }

        @Test
        fun `deletes specification when it exists`() {
            val existing = sampleEntity(id = 15L, profileName = "to-delete")
            every { repository.findById(15L) } returns Optional.of(existing)
            every { repository.delete(existing) } returns Unit

            service.deleteSpecification(15L)

            verify(exactly = 1) { repository.findById(15L) }
            verify(exactly = 1) { repository.delete(existing) }
        }
    }
}
