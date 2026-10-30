package com.commitlens.commitlensapi.specification.internal.repository

import com.commitlens.commitlensapi.specification.internal.entity.CommitSpecification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CommitSpecificationRepository : JpaRepository<CommitSpecification, Long> {
    fun findByProfileName(profileName: String): CommitSpecification?
    fun existsByProfileName(profileName: String): Boolean
}
