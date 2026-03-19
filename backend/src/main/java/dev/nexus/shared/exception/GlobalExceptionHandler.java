package dev.nexus.shared.exception;

import dev.nexus.shared.dto.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * Central place that catches exceptions thrown anywhere in the application
 * and converts them into clean, consistent ApiResponse error responses.
 *
 * Without this class, if something throws an exception in a controller or service,
 * Spring would return its own raw ugly error JSON that doesn't match your ApiResponse shape.
 *
 * With this class, every exception is caught here, wrapped in ApiResponse.error(...),
 * and returned with the correct HTTP status code — automatically, without any try/catch
 * needed in your controllers.
 *
 * How it works:
 *   1. A controller or service throws an exception (intentionally or not)
 *   2. Spring sees the exception, looks for a matching @ExceptionHandler in this class
 *   3. That handler runs, builds an ApiResponse.error(...) and returns it with an HTTP status
 *   4. The caller receives a clean JSON error instead of a Spring stack trace
 *
 * ApiResponse<Void> is used as the return type for all handlers because error
 * responses never carry a data payload — only success:false and a message.
 */
@RestControllerAdvice // Marks this class as a global exception handler for all @RestController classes
public class GlobalExceptionHandler {

    /**
     * Triggered when a database entity lookup fails — e.g. "User with id 5 not found".
     * EntityNotFoundException is typically thrown manually in your service layer
     * when a .findById() returns empty.
     * Returns HTTP 404 Not Found.
     */
    @ExceptionHandler(EntityNotFoundException.class) // tells Spring: run this method when EntityNotFoundException is thrown
    public ResponseEntity<ApiResponse<Void>> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)               // HTTP 404
                .body(ApiResponse.error(ex.getMessage()));  // puts the exception's message into the response body
    }

    /**
     * Triggered when a user tries to access a resource they don't have permission for.
     * Spring Security throws AccessDeniedException automatically when a secured
     * endpoint is hit by a user without the required role.
     * Returns HTTP 403 Forbidden.
     *
     * Note: the original ex.getMessage() is intentionally NOT used here —
     * you don't want to leak internal security details to the caller.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)               // HTTP 403
                .body(ApiResponse.error("Access denied"));  // generic message — intentionally vague for security
    }

    /**
     * Triggered when a request body fails @Valid / @Validated bean validation.
     * For example, if a field is @NotBlank and an empty string is sent, Spring throws this.
     *
     * MethodArgumentNotValidException holds a list of field-level errors (FieldError),
     * so we extract all of them and join them into one readable string.
     *
     * Example output: "email: must not be blank, age: must be greater than 0"
     *
     * Returns HTTP 400 Bad Request.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {

        String errors = ex.getBindingResult()   // getBindingResult() holds all the validation failures
                .getFieldErrors()               // getFieldErrors() gives a list of per-field errors
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage()) // formats each as "fieldName: error message"
                .collect(Collectors.joining(", ")); // joins all errors into one comma-separated string

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)     // HTTP 400
                .body(ApiResponse.error(errors));   // the joined validation errors become the response message
    }

    /**
     * Triggered when business logic explicitly rejects invalid input.
     * You throw this manually in your service layer like:
     *   throw new IllegalArgumentException("Email already in use");
     *
     * Returns HTTP 400 Bad Request.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)             // HTTP 400
                .body(ApiResponse.error(ex.getMessage()));  // uses whatever message you passed when throwing
    }

    /**
     * The catch-all fallback. If an exception is thrown that doesn't match
     * any of the handlers above, it lands here.
     *
     * This prevents Spring from returning its default error page or leaking
     * a stack trace to the client. Instead the caller always gets a clean
     * ApiResponse with a generic message.
     *
     * Returns HTTP 500 Internal Server Error.
     *
     * Note: the real exception (ex) is intentionally not exposed in the response —
     * you'd log it here in production (e.g. log.error(..., ex)) but never send
     * internal details to the caller.
     */
    @ExceptionHandler(Exception.class) // Exception.class is the base class of all exceptions — matches anything
    public ResponseEntity<ApiResponse<Void>> handleException(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)           // HTTP 500
                .body(ApiResponse.error("An unexpected error occurred")); // generic message — never expose internals
    }
}