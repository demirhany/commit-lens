package com.commitlens.commitlensapi.specification.internal.api

import com.commitlens.commitlensapi.parser.api.ScopePolicy
import com.commitlens.commitlensapi.parser.api.dto.CommitPolicyDto
import com.commitlens.commitlensapi.specification.internal.entity.CommitSpecification
import com.commitlens.commitlensapi.specification.internal.entity.SpecificCommitScope
import com.commitlens.commitlensapi.specification.internal.entity.SpecificCommitType
import com.commitlens.commitlensapi.specification.internal.repository.CommitSpecificationRepository
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class DefaultCommitSpecificationApiTest {

    private val repository: CommitSpecificationRepository = mockk()
    private val api = DefaultCommitSpecificationApi(repository)

    @BeforeEach
    fun setUp() = clearAllMocks()

    @Test
    fun `returns DEFAULT policy when profileName is null`() {
        val policy = api.getCommitPolicy(null)

        assertEquals(CommitPolicyDto.DEFAULT, policy)
        verify(exactly = 0) { repository.findByProfileName(any()) }
    }

    @Test
    fun `returns DEFAULT policy when profileName is blank`() {
        val policy = api.getCommitPolicy("   ")

        assertEquals(CommitPolicyDto.DEFAULT, policy)
        verify(exactly = 0) { repository.findByProfileName(any()) }
    }

    @Test
    fun `returns DEFAULT policy when profile is not found in repository`() {
        every { repository.findByProfileName("non-existent") } returns null

        val policy = api.getCommitPolicy("non-existent")

        assertEquals(CommitPolicyDto.DEFAULT, policy)
        verify(exactly = 1) { repository.findByProfileName("non-existent") }
    }

    @Test
    fun `maps types, scopes and scopePolicy when profile is found`() {
        val spec = CommitSpecification(
            id = 1L,
            profileName = "custom",
            description = "Custom profile",
            scopePolicy = ScopePolicy.REQUIRED
        ).apply {
            types = mutableListOf(
                SpecificCommitType(id = 10L, name = "feat", description = "New feature", standard = this),
                SpecificCommitType(id = 11L, name = "fix", description = "Bug fix", standard = this)
            )
            scopes = mutableListOf(
                SpecificCommitScope(id = 20L, name = "core", description = "Core module", standard = this),
                SpecificCommitScope(id = 21L, name = "parser", description = "Parser module", standard = this)
            )
        }

        every { repository.findByProfileName("custom") } returns spec

        val policy = api.getCommitPolicy("custom")

        assertEquals(listOf("feat", "fix"), policy.types)
        assertEquals(listOf("core", "parser"), policy.scopes)
        assertEquals(ScopePolicy.REQUIRED, policy.scopePolicy)
        verify(exactly = 1) { repository.findByProfileName("custom") }
    }
}
