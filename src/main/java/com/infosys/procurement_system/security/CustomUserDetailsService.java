package com.infosys.procurement_system.security;

import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Custom UserDetailsService implementation loaded automatically by Spring Security's
 * DaoAuthenticationProvider to look up users by their email during login.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmployeeId) throws UsernameNotFoundException {
        User user = userRepository.findByEmailOrEmployeeId(usernameOrEmployeeId, usernameOrEmployeeId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or employee ID: " + usernameOrEmployeeId));
        return new CustomUserDetails(user);
    }
}
