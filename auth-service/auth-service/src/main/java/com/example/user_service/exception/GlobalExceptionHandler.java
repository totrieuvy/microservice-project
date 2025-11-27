package com.example.user_service.exception;

import com.example.common.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Locale;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @Autowired
    private MessageSource messageSource;

    // Lỗi validation dto
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ApiResponse<?> handleValidationExceptions(MethodArgumentNotValidException ex, Locale locale) {

        String defaultMessage = ex.getBindingResult()
                .getAllErrors()
                .get(0)
                .getDefaultMessage();

        // Validation dùng TEXT luôn → không cần dịch
        return ApiResponse.error(400, defaultMessage);
    }

    // Lỗi email đã tồn tại
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ApiResponse<?> handleEmailExists(EmailAlreadyExistsException ex, Locale locale) {

        String localizedMessage = messageSource.getMessage(
                ex.getMessage(),     // KEY
                null,
                locale
        );

        return ApiResponse.error(400, localizedMessage);
    }

    @ExceptionHandler(WrongCredentialsException.class)
    public ApiResponse<?> handleWrongCredentials(WrongCredentialsException ex, Locale locale) {

        String localizedMessage = messageSource.getMessage(
                ex.getMessage(),   // KEY
                null,
                locale
        );

        return ApiResponse.error(400, localizedMessage);
    }

    // Bắt tất cả lỗi khác
    @ExceptionHandler(Exception.class)
    public ApiResponse<?> handleException(Exception ex) {
        ex.printStackTrace();
        return ApiResponse.error(500, "Internal server error: " + ex.getMessage());
    }
}
