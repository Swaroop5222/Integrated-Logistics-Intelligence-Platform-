package com.shiptrack.controller;

import com.shiptrack.model.UserLoginRequest;
import com.shiptrack.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginRequest user){
        try{
            // if username and password are correct then we get authentication else will throw exception
            Authentication authentication = authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));

            // get principle return the user data after checking with the database using DaoAuthProvider
            UserDetails userDetails = (UserDetails)authentication.getPrincipal(); // get user details of authenticated user

            String token = jwtUtil.generateToken(userDetails);

            return ResponseEntity.ok(Map.of("token", token));

        }
        catch (Exception e){
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid Username and Password " + e));
        }

    }
}
