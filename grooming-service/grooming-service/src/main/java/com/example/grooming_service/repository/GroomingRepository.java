package com.example.grooming_service.repository;

import com.example.grooming_service.entity.Grooming;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroomingRepository extends JpaRepository<Grooming, Long> {
}
