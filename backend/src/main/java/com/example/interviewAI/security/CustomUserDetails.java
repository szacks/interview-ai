package com.example.interviewAI.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Custom UserDetails that includes company context along with user information.
 * This allows us to pass company information through the security context
 * without needing to query the database on every request.
 */
public class CustomUserDetails implements UserDetails {
    private final Long userId;
    private final String email;
    private final String password;
    private final Long companyId;
    private final String role;
    private final boolean enabled;

    public CustomUserDetails(Long userId, String email, String password, Long companyId, String role) {
        this.userId = userId;
        this.email = email;
        this.password = password;
        this.companyId = companyId;
        this.role = role;
        this.enabled = true;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        if (role != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
        }
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    // Custom getters
    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public String getRole() {
        return role;
    }
}
