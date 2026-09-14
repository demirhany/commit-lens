package com.commitlens.commitlensapi.exception

import org.springframework.http.HttpStatus

abstract class BaseApiException(
    override val message: String,
    val status: HttpStatus
) : RuntimeException(message)

// ── 404 ──────────────────────────────────────────────────────────────────────
// Requested commit, repo or any identifiable resource could not be found.
class ResourceNotFoundException(message: String) : BaseApiException(message, HttpStatus.NOT_FOUND)

// ── 400 ──────────────────────────────────────────────────────────────────────
// The caller supplied an unsupported Git provider identifier.
class UnsupportedProviderException(message: String) : BaseApiException(message, HttpStatus.BAD_REQUEST)

// A generic request-parameter constraint was violated (e.g. limit ≤ 0).
class InvalidRequestParameterException(message: String) : BaseApiException(message, HttpStatus.BAD_REQUEST)

// The commit search query is blank or effectively empty.
class EmptySearchQueryException(message: String = "Search query must not be blank") :
    BaseApiException(message, HttpStatus.BAD_REQUEST)

// The requested feature is not supported by the selected Git provider.
class ProviderCapabilityNotSupportedException(message: String) : BaseApiException(message, HttpStatus.BAD_REQUEST)