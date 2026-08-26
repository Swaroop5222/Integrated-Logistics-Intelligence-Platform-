package com.shiptrack.security;

import com.shiptrack.config.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/*
Reason for extending OncePerRequestFilter
👉 To guarantee that your JWT filter runs exactly ONCE per HTTP request
If we extend normal Filter then the code may get executed multiple times
It is an industry standard to use OncePerRequestFilter
 */
@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization"); // getting header from request

        if(authHeader == null || ! authHeader.startsWith("Bearer ")){
            // if there is no header or no token then simply pass to next filter
            filterChain.doFilter(request, response);
            return;
        }
        String token = authHeader.substring(7); // getting only token

        System.out.println("JWT Token : " + token);

        try{
            String userName = jwtUtil.extractUserName(token);

            System.out.println("User Name extracted from token : " + userName);


//            if username is not already authenticated return null - SecurityContextHolder.getContext().getAuthentication()
            if(userName != null && SecurityContextHolder.getContext().getAuthentication() == null){

                UserDetails userDetails = customUserDetailsService.loadUserByUsername(userName);
                System.out.println("user Details : " + userDetails);

                if(jwtUtil.validateToken(token, userDetails)){


                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails.getUsername(),
                                    userDetails.getPassword(),
                                    userDetails.getAuthorities()
                            );

                    // store client data
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // to let know spring that user is authenticated
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }
            }
        }
        catch (Exception e){
            System.out.println("Failed while authentication " + e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        filterChain.doFilter(request, response);
    }
}
