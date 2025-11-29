package com.example.interviewAI.repository;

import com.example.interviewAI.entity.User;
import com.example.interviewAI.enums.RoleEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByCompanyId(Long companyId);

    List<User> findByCompanyIdAndRole(Long companyId, RoleEnum role);

    @Query("SELECT u FROM User u WHERE u.company.id = ?1 AND u.role = ?2")
    List<User> findInterviewersByCompany(Long companyId, RoleEnum role);
}
