package com.shiptrack.controller;

import com.shiptrack.dto.UserDto;
import com.shiptrack.entity.User;
import com.shiptrack.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getMe() {
        UserDto currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(currentUser);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        UserDto dto = new UserDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getRegisterId(),
                user.getPhoneNumber(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
        dto.setAddress(user.getAddress());
        dto.setCity(user.getCity());
        dto.setState(user.getState());
        dto.setCountry(user.getCountry());
        dto.setPostalCode(user.getPostalCode());
        dto.setCompanyName(user.getCompanyName());
        dto.setRegistrationNumber(user.getRegistrationNumber());
        dto.setGstTaxId(user.getGstTaxId());
        dto.setContactPersonName(user.getContactPersonName());
        dto.setOrganizationName(user.getOrganizationName());
        dto.setLicenseRegistrationNumber(user.getLicenseRegistrationNumber());
        dto.setTransportationMode(user.getTransportationMode());
        dto.setOperatingArea(user.getOperatingArea());
        dto.setEmployeeId(user.getEmployeeId());
        dto.setDepartment(user.getDepartment());
        return ResponseEntity.ok(dto);
    }
}
