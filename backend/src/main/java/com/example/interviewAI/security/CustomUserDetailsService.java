package com.example.interviewAI.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.example.interviewAI.repository.UserRepository;

import java.util.ArrayList;
import java.util.Collection;

@Slf4j
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        try {
            Long id = Long.parseLong(userId);
            com.example.interviewAI.entity.User user = userRepository.findById(id)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));

            return new User(
                    user.getEmail(),
                    user.getPasswordHash(),
                    getAuthorities(user)
            );
        } catch (NumberFormatException ex) {
            throw new UsernameNotFoundException("Invalid user ID format: " + userId);
        }
    }

    /**
     * Get authorities/roles for user
     */
    private Collection<? extends GrantedAuthority> getAuthorities(com.example.interviewAI.entity.User user) {
        Collection<GrantedAuthority> authorities = new ArrayList<>();

        // Add role as authority with ROLE_ prefix
        String role = user.getRole();
        if (role != null) {
            if (!role.startsWith("ROLE_")) {
                role = "ROLE_" + role.toUpperCase();
            }
            authorities.add(new SimpleGrantedAuthority(role));
        }

        return authorities;
    }
}
