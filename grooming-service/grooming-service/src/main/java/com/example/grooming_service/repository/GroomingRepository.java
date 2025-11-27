package com.example.grooming_service.repository;

import com.example.grooming_service.entity.Services;
import com.example.grooming_service.enums.GroomingEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroomingRepository extends JpaRepository<Services, Long> {
//    List<Services> findByType(GroomingEnum type);

    @Query("SELECT s from Services s WHERE s.type = :type")
    List<Services> getAllSingleServices(@Param("type") GroomingEnum type);
}
