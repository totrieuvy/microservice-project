package com.example.user_service.exception;

import com.example.user_service.config.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Lỗi validation dto
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ApiResponse<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult()
                .getAllErrors()
                .get(0)
                .getDefaultMessage();

        return ApiResponse.error(400, errorMessage);
    }

    // Lỗi email đã tồn tại
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ApiResponse<?> handleEmailExists(EmailAlreadyExistsException ex) {
        return ApiResponse.error(400, ex.getMessage());
    }

    @ExceptionHandler(WrongCredentialsException.class)
    public ApiResponse<?> handleWrongCredentials(WrongCredentialsException ex) {
        return ApiResponse.error(400, ex.getMessage());
    }

    // Bắt tất cả lỗi khác
    @ExceptionHandler(Exception.class)
    public ApiResponse<?> handleException(Exception ex) {
        ex.printStackTrace();
        return ApiResponse.error(500, "Internal server error: " + ex.getMessage());
    }
}
