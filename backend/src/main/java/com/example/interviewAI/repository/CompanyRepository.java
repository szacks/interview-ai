package com.example.interviewAI.repository;

import com.example.interviewAI.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByEmail(String email);

    Optional<Company> findByStripeCustomerId(String stripeCustomerId);
}
