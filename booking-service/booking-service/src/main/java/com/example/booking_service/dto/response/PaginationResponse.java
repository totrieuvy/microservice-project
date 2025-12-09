package com.example.booking_service.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class PaginationResponse<T> {
    private List<T> content;
    private int page;
    private int totalPages;
    private long totalElements;
}
