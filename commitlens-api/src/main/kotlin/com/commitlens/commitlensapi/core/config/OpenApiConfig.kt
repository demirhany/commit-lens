package com.commitlens.commitlensapi.core.config

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.info.License
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenApiConfig {

    @Bean
    fun openAPI(): OpenAPI = OpenAPI()
        .info(
            Info()
                .title("CommitLens API")
                .version("0.1.0-alpha")
                .description("Lightweight Git commit history analytics and Conventional Commits compliance engine.")
                .license(License().name("MIT").url("https://opensource.org/licenses/MIT"))
        )
}
