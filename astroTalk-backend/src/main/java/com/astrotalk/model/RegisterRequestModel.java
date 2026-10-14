package com.astrotalk.model;

import com.astrotalk.config.LocalTimeDeserializer;
import com.astrotalk.entity.Gender;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class RegisterRequestModel {
    @NotBlank(message = "Name is required")
    private String name;
    @NotBlank(message = "Email is required")
    @Email(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*\\.[A-Za-z]{2,}$",
            message = "Invalid email format")
    private String email;
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    private String phone;
    private LocalDate dateOfBirth;
    @JsonDeserialize(using = LocalTimeDeserializer.class)
    private LocalTime timeOfBirth;
    private String placeOfBirth;
    private Double latitude;
    private Double longitude;
    private Gender gender;
}
