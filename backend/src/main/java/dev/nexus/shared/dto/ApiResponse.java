package dev.nexus.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * A generic wrapper that standardizes every API response in the application.
 *
 * Instead of each endpoint returning raw data or its own shape, every response
 * goes through this class so the frontend always gets a predictable structure:
 *
 *   {
 *     "success": true,
 *     "message": "User created",   <- only present when set
 *     "data": { ... },             <- the actual payload
 *     "timestamp": "2024-01-01T00:00:00Z"
 *   }
 *
 * The <T> generic means the `data` field is type-safe per usage:
 *   ApiResponse<UserDto>        -> data is a UserDto
 *   ApiResponse<List<OrderDto>> -> data is a list of orders
 *   ApiResponse<Void>           -> no payload, just success/message
 */
@Data                                          // Lombok: generates getters, setters, equals, hashCode, toString
@Builder                                       // Lombok: enables ApiResponse.builder()...build() pattern
@NoArgsConstructor                             // Lombok: required by Jackson for JSON deserialization
@AllArgsConstructor                            // Lombok: needed internally by @Builder to set all fields
@JsonInclude(JsonInclude.Include.NON_NULL)     // Jackson: fields that are null won't appear in the JSON output at all
public class ApiResponse<T> {

    // Whether the request was handled successfully or not.
    // Gives the frontend a single boolean to check before reading `data`.
    private boolean success;

    // Optional human-readable context — set on errors to explain what went wrong,
    // or on success when a plain confirmation is useful (e.g. "Password updated").
    // Omitted from JSON when null (due to @JsonInclude above).
    private String message;

    // The actual response payload. Type varies per endpoint based on <T>.
    // On error responses this is null — only `success` and `message` are populated.
    private T data;

    // Auto-set to the current UTC time when the response object is built.
    // @Builder.Default is required here — without it, Lombok's @Builder ignores
    // field-level initializers and would set this to null instead.
    @Builder.Default
    private Instant timestamp = Instant.now();

    // -------------------------------------------------------------------------
    // Static factory methods — the intended way to create responses.
    // These keep controller code clean, e.g: return ApiResponse.success(userDto);
    // instead of manually calling the builder every time.
    // -------------------------------------------------------------------------

    // Use when the operation succeeded and you only need to return data.
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    // Use when the operation succeeded and a message adds useful context
    // alongside the data (e.g. "Profile updated", updatedUserDto).
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    // Use when the operation failed. No data payload — only the error message.
    // Typically called from a global exception handler, not individual controllers.
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
}