package com.commitlens.commitlensapi.specification.internal.entity

import com.commitlens.commitlensapi.core.model.base.BaseEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

@Entity
@Table(
    name = "specific_commit_types",
    uniqueConstraints = [
        jakarta.persistence.UniqueConstraint(
            name = "unique_type_name_per_standard",
            columnNames = ["name", "commit_standard_specification_id"]
        )
    ]
)
class SpecificCommitType(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 50)
    var name: String,

    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commit_standard_specification_id", nullable = false)
    var standard: CommitSpecification? = null
) : BaseEntity()
