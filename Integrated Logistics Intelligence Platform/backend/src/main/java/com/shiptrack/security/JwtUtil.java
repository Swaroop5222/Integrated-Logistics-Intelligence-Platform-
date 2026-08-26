package com.shiptrack.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
    private static final String SECRET_KEY_STRING = "6d53d640ba4272e088f2622e1c23e5dc";

    private final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET_KEY_STRING.getBytes());
    // generate JWT token
    public String generateToken(UserDetails userDetails){

        final int HOUR = 1000 * 60 * 60;
        final int MINUTE = 1000 * 60;
         return Jwts
                .builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + MINUTE * 5)) // 5 minutes
                 .signWith(SECRET_KEY, Jwts.SIG.HS256)
                 .compact();
    }


    // validation
    public boolean validateToken(String token, UserDetails userDetails){
        try{
            String un = extractUserName(token);
        /*
        Now checking both username are same
         */
            return un.equals(userDetails.getUsername());
        }
        catch (Exception e){
            System.out.println("Failed while Validating " + e);
            return false;
        }
    }

    /*
    In the below method we are giving the token which is generated while login
    and we're decrypting and getting only user name
     */
    public String extractUserName(String token){
        return Jwts
                .parser()
                .verifyWith(SECRET_KEY) // same key which is used while encryption
                .build()
                .parseSignedClaims(token)
                .getPayload() // return whole data given while creation
                .getSubject(); // getting only subject(username) while creation of token
    }
}
