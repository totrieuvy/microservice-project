package com.example.hamster_service.repository;

import com.example.hamster_service.entity.Hamster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HamsterRepository extends JpaRepository<Hamster, Long> {
    Hamster findHamsterById(Long id);

    List<Hamster> findAllByUserId(Long userId);
}
