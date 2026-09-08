package com.commitlens.commitlensapi.core.model.base

import java.time.Instant

data class ApiResponse<T> (
    val success: Boolean,
    val status: Int,
    val message: String? = null,
    val data: T? = null,
    val details: List<String>? = null,
    val timestamp: Instant? = Instant.now(),
) {
    companion object {
        fun <T> success(data: T, status: Int = 200, message: String? = null): ApiResponse<T> {
            return ApiResponse(
                success = true,
                status = status,
                message = message,
                data = data
            )
        }

        // Hata senaryoları için factory metot (data içermez)
        fun error(status: Int, message: String, details: List<String>? = null): ApiResponse<Unit> {
            return ApiResponse(
                success = false,
                status = status,
                message = message,
                data = null,
                details = details
            )
        }
    }
}