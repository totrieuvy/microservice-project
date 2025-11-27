package com.example.grooming_service.repository;

import com.example.grooming_service.entity.ServiceDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroomingDetailRepository extends JpaRepository<ServiceDetail, Long> {
}
