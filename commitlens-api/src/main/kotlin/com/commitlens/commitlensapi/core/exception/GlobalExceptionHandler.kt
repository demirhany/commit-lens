package com.commitlens.commitlensapi.core.exception

import com.commitlens.commitlensapi.core.model.base.ApiResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.HttpServerErrorException
import org.springframework.web.client.ResourceAccessException
import org.springframework.web.client.RestClientException
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException

@RestControllerAdvice
class GlobalExceptionHandler {

    // ── Internal / application-level exceptions ───────────────────────────────

    // Handle all BaseApiException subclasses and return a standardized error response.
    @ExceptionHandler(BaseApiException::class)
    fun handleBaseApiException(ex: BaseApiException): ResponseEntity<ApiResponse<Unit>> {
        val errorResponse = ApiResponse.error(
            status = ex.status.value(),
            message = ex.message
        )
        return ResponseEntity.status(ex.status).body(errorResponse)
    }

    // ── Spring MVC binding / validation exceptions ────────────────────────────

    // @Valid / @Validated field-level constraint violations.
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(ex: MethodArgumentNotValidException): ResponseEntity<ApiResponse<Unit>> {
        val errors = ex.bindingResult.fieldErrors.map { "${it.field}: ${it.defaultMessage}" }
        val errorResponse = ApiResponse.error(
            status = HttpStatus.BAD_REQUEST.value(),
            message = "The request contains invalid parameters",
            details = errors
        )
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse)
    }

    // Triggered when a @RequestParam or @PathVariable cannot be converted to the target type.
    // Most commonly seen when an invalid enum value is supplied (e.g. provider=GITLAB).
    @ExceptionHandler(MethodArgumentTypeMismatchException::class)
    fun handleMethodArgumentTypeMismatch(ex: MethodArgumentTypeMismatchException): ResponseEntity<ApiResponse<Unit>> {
        val paramName = ex.name
        val suppliedValue = ex.value
        val expectedType = ex.requiredType?.simpleName ?: "unknown"
        val errorResponse = ApiResponse.error(
            status = HttpStatus.BAD_REQUEST.value(),
            message = "Invalid value '$suppliedValue' for parameter '$paramName'. Expected type: $expectedType"
        )
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse)
    }

    // Triggered when a required @RequestParam is completely absent from the request.
    @ExceptionHandler(MissingServletRequestParameterException::class)
    fun handleMissingServletRequestParameter(ex: MissingServletRequestParameterException): ResponseEntity<ApiResponse<Unit>> {
        val errorResponse = ApiResponse.error(
            status = HttpStatus.BAD_REQUEST.value(),
            message = "Required request parameter '${ex.parameterName}' of type '${ex.parameterType}' is missing"
        )
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse)
    }

    // ── External / Git provider HTTP exceptions ────────────────────────────────

    // HTTP 4xx responses from the Git provider (e.g. 401 Unauthorized, 404 Not Found, 429 Rate Limit).
    @ExceptionHandler(HttpClientErrorException::class)
    fun handleHttpClientErrorException(ex: HttpClientErrorException): ResponseEntity<ApiResponse<Unit>> {
        val statusCode = ex.statusCode
        val customMessage = when (statusCode) {
            HttpStatus.NOT_FOUND -> "Resource not found on the provider"
            HttpStatus.UNAUTHORIZED -> "Unauthorized access to the provider — check your token"
            HttpStatus.FORBIDDEN -> "Access forbidden by the provider"
            HttpStatus.TOO_MANY_REQUESTS -> "Provider rate limit exceeded — please retry later"
            HttpStatus.UNPROCESSABLE_CONTENT -> "Provider rejected the request — check query parameters"
            else -> ex.statusText.ifBlank { "An error occurred while communicating with the provider" }
        }
        val errorResponse = ApiResponse.error(
            status = ex.statusCode.value(),
            message = customMessage
        )
        return ResponseEntity.status(ex.statusCode).body(errorResponse)
    }

    // HTTP 5xx responses from the Git provider.
    @ExceptionHandler(HttpServerErrorException::class)
    fun handleHttpServerErrorException(ex: HttpServerErrorException): ResponseEntity<ApiResponse<Unit>> {
        val errorResponse = ApiResponse.error(
            status = HttpStatus.BAD_GATEWAY.value(),
            message = "Git provider server error — the upstream service is temporarily unavailable"
        )
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(errorResponse)
    }

    // Network/connectivity failures when trying to reach the Git provider (e.g. DNS failure, connection timeout).
    @ExceptionHandler(ResourceAccessException::class)
    fun handleResourceAccessException(ex: ResourceAccessException): ResponseEntity<ApiResponse<Unit>> {
        val errorResponse = ApiResponse.error(
            status = HttpStatus.SERVICE_UNAVAILABLE.value(),
            message = "Unable to reach Git provider. Check network connectivity or base URL configuration."
        )
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse)
    }

    // Catch-all for any other RestClient-level failures not already covered above
    // (e.g. connection refused that slipped past GitHubRestClient's own handler).
    @ExceptionHandler(RestClientException::class)
    fun handleRestClientException(ex: RestClientException): ResponseEntity<ApiResponse<Unit>> {
        val errorResponse = ApiResponse.error(
            status = HttpStatus.BAD_GATEWAY.value(),
            message = "Failed to communicate with the Git provider: ${ex.message ?: "unknown error"}"
        )
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(errorResponse)
    }

    // ── Fallback ───────────────────────────────────────────────────────────────

    // Last-resort handler for any unhandled exception.
    @ExceptionHandler(Exception::class)
    fun handleGeneralException(ex: Exception): ResponseEntity<ApiResponse<Unit>> {
        val errorResponse = ApiResponse.error(
            status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
            message = "An unexpected server error occurred"
        )
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse)
    }
}
