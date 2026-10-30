package com.commitlens.commitlensapi.specification.internal.entity

import com.commitlens.commitlensapi.core.model.base.BaseEntity
import com.commitlens.commitlensapi.parser.api.ScopePolicy
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import org.hibernate.annotations.BatchSize

@Entity
class CommitSpecification(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 50, unique = true)
    var profileName: String,

    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    @BatchSize(size = 50)
    @OneToMany(mappedBy = "standard", cascade = [CascadeType.ALL], orphanRemoval = true)
    var types: MutableList<SpecificCommitType> = mutableListOf(),

    @BatchSize(size = 50)
    @OneToMany(mappedBy = "standard", cascade = [CascadeType.ALL], orphanRemoval = true)
    var scopes: MutableList<SpecificCommitScope> = mutableListOf(),

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var scopePolicy: ScopePolicy
) : BaseEntity() {
    fun addType(type: SpecificCommitType) {
        types.add(type)
        type.standard = this
    }

    fun addScope(scope: SpecificCommitScope) {
        scopes.add(scope)
        scope.standard = this
    }
}
