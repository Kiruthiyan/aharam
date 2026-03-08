package com.aharam.tuition.config;

import com.aharam.tuition.security.JwtAuthenticationFilter;
import com.aharam.tuition.security.RestAccessDeniedHandler;
import com.aharam.tuition.security.RestAuthenticationEntryPoint;
import com.aharam.tuition.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private RestAuthenticationEntryPoint authenticationEntryPoint;

    @Autowired
    private RestAccessDeniedHandler accessDeniedHandler;

    @Bean
    public JwtAuthenticationFilter authenticationJwtTokenFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
                    // Restrict CORS to specific origins only
                    corsConfiguration.setAllowedOriginPatterns(java.util.List.of(
                            "http://localhost:3000",     // Local development
                            "http://localhost:3001",     // Alternative local port
                            "http://127.0.0.1:3000",     // Local development (IP)
                            "https://aharam.lk",          // Production domain
                            "https://www.aharam.lk"       // Production domain with www
                    ));
                    corsConfiguration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    corsConfiguration.setAllowedHeaders(java.util.List.of("*"));
                    corsConfiguration.setAllowCredentials(true);
                    return corsConfiguration;
                }))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/staff/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/reports/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/api/dashboard/**").hasAnyRole("SUPER_ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.POST, "/api/attendance/**").hasRole("STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/attendance/**").hasRole("STAFF")
                        .requestMatchers(HttpMethod.DELETE, "/api/attendance/**").hasRole("STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/attendance/**").hasAnyRole("SUPER_ADMIN", "STAFF")
                        .requestMatchers("/api/fees/admin/**").hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/fees/**").hasRole("STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/fees/**").hasRole("STAFF")
                        .requestMatchers(HttpMethod.DELETE, "/api/fees/**").hasRole("STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/fees/**").hasAnyRole("SUPER_ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.POST, "/api/marks/**").hasRole("STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/marks/**").hasRole("STAFF")
                        .requestMatchers(HttpMethod.DELETE, "/api/marks/**").hasRole("STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/marks/**").hasAnyRole("SUPER_ADMIN", "STAFF")
                        .requestMatchers("/api/students/**").hasAnyRole("SUPER_ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.POST, "/api/notifications/send").hasAnyRole("SUPER_ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.POST, "/api/notifications/token")
                        .hasAnyRole("SUPER_ADMIN", "STAFF", "STUDENT")
                        .requestMatchers(HttpMethod.GET, "/api/notifications/**")
                        .hasAnyRole("SUPER_ADMIN", "STAFF", "STUDENT")
                        .requestMatchers("/api/student-dashboard/**").hasAnyRole("STUDENT")
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated());

        http.authenticationProvider(authenticationProvider());

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
