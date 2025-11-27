//package com.example.user_service.config;
//
//import lombok.AllArgsConstructor;
//import lombok.Builder;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//@Data
//@Builder
//@NoArgsConstructor
//@AllArgsConstructor
//public class ApiResponse<T> {
//    private int code;
//    private String message;
//    private T data;
//
//    // Helper method để tạo response thành công
//    public static <T> ApiResponse<T> success(String message, T data) {
//        return ApiResponse.<T>builder()
//                .code(200)
//                .message(message)
//                .data(data)
//                .build();
//    }
//
//    // Helper method để tạo response thất bại
//    public static <T> ApiResponse<T> error(int code, String message) {
//        return ApiResponse.<T>builder()
//                .code(code)
//                .message(message)
//                .data(null)
//                .build();
//    }
//}
