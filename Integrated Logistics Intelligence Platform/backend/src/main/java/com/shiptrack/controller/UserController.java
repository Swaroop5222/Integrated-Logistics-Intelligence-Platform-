package com.shiptrack.controller;

import com.shiptrack.model.User;
import com.shiptrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // CREATE
    @PostMapping
    public User createUser(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if(user.getRole() == null){
            user.setRole("USER");
        }else{
            user.setRole(user.getRole().toUpperCase());
        }
        return userRepository.save(user);
    }

    // READ ALL
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // READ BY ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // UPDATE
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @RequestBody User updatedUser) {

        return userRepository.findById(id)
                .map(user -> {
                    user.setUsername(updatedUser.getUsername());
                    user.setPassword(updatedUser.getPassword());
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }


}
