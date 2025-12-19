package com.example.booking_service.config;

import com.example.booking_service.exception.AppointmentServiceException;
import com.example.booking_service.exception.SlotFullException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class AppointmentClient {

    private final RestTemplate restTemplate;

    public void reserveSlot(Long slotId) {
        try {
            restTemplate.put(
                    "http://appointment-service/api/schedules/slots/" + slotId + "/reserve",
                    null
            );
        }
        catch (HttpClientErrorException.Conflict e) {
            // slot hết
            throw new SlotFullException("Slot đã hết");
        }
        catch (HttpStatusCodeException e) {
            // các lỗi HTTP khác
            throw new AppointmentServiceException(
                    "Appointment-service error: " + e.getStatusCode(),
                    e
            );
        }
        catch (Exception e) {
            // network / timeout / crash
            throw new AppointmentServiceException(
                    "Cannot connect to appointment-service",
                    e
            );
        }
    }

    public void releaseSlot(Long slotId) {
        restTemplate.put(
                "http://appointment-service/api/schedules/slots/" + slotId + "/release",
                null
        );
    }
}

