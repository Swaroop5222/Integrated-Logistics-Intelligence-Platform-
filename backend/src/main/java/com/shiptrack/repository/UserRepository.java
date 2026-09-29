package com.shiptrack.repository;

import com.shiptrack.entity.User;
import com.shiptrack.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByRegisterId(String registerId);

    List<User> findByRole(Role role);
}
