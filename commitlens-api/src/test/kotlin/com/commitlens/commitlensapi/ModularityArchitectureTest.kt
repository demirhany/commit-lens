package com.commitlens.commitlensapi

import org.junit.jupiter.api.Test
import org.springframework.modulith.core.ApplicationModules
import org.springframework.modulith.docs.Documenter

class ModularityArchitectureTest {

    private val modules = ApplicationModules.of(CommitlensApiApplication::class.java)

    @Test
    fun `verify modular structure and boundaries`() {
        modules.verify()
    }

    @Test
    fun `inspect application modules`() {
        println(modules)
    }

    @Test
    fun `generate architecture documentation and plantuml diagrams`() {
        Documenter(modules)
            .writeDocumentation()
            .writeModulesAsPlantUml()
            .writeModuleCanvases()
    }
}