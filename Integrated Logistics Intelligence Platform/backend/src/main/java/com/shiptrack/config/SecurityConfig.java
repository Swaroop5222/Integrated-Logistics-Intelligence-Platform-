package com.shiptrack.config;

import com.shiptrack.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFileterChain(HttpSecurity http){

//        return http.authorizeHttpRequests(auth ->
//                auth.anyRequest().permitAll()
//        ).build(); // allow all request

        http.authorizeHttpRequests(auth ->
                auth
                        .requestMatchers("/auth/**").permitAll()
.requestMatchers(HttpMethod.POST, "/api/users").permitAll()
.requestMatchers("/api/users/**").authenticated() // dont allow this only
                        .requestMatchers("/dashboard").permitAll() // permit specific endpoing only
                        .anyRequest().permitAll() // allow all others url

                )
//                .formLogin(form ->
//                    form
//                        .permitAll()// allow form page (blocked by above)
//                        .defaultSuccessUrl("/dashboard")
//                )
                .csrf(csrf ->
                        csrf.disable()
                ).
                sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )  // stateless - no session mgnt
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        ;

        return http.build();
    }

//    In memory User
//    @Bean
//    public UserDetailsService userDetailService(PasswordEncoder passwordEncoder){
//        UserDetails user = User.withUsername("user1")
//                                .password(passwordEncoder.encode("abc"))
//                                .roles("USER")
//                                .build();
//        UserDetails admin = User.withUsername("admin")
//                .password(passwordEncoder.encode("abc"))
//                .roles("ADMIN")
//                .build();
//
//        return new InMemoryUserDetailsManager(user, admin);
//
//    }

//    From databases
    @Bean
    public UserDetailsService userDetailService(){
        return new CustomUserDetailsService();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider authprovider = new DaoAuthenticationProvider(userDetailService());
//        authprovider.setUserDetailsService(userDetailService());
        authprovider.setPasswordEncoder(passwordEncoder());
        return authprovider;
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

//    This autentication manager tells that the authenticationProvider which is defined (DaoAuthenticationProvider in this case)
//    Later this AuthenticationManager will check with the given user data and return token
    @Bean
    public AuthenticationManager authenticationManager(){
        return new ProviderManager(List.of(authenticationProvider()));
    }
}
