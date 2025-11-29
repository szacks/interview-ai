package com.example.interviewAI.enums;

public enum RoleEnum {
    ADMIN("admin"),
    INTERVIEWER("interviewer"),
    CANDIDATE("candidate");

    private final String value;

    RoleEnum(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static RoleEnum fromValue(String value) {
        for (RoleEnum role : RoleEnum.values()) {
            if (role.value.equals(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + value);
    }
}
