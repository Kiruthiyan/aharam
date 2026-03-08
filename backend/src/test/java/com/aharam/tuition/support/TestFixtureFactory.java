package com.aharam.tuition.support;

import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.entity.StudentStatus;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.repository.StudentRepository;
import com.aharam.tuition.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class TestFixtureFactory {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public TestFixtureFactory(
            UserRepository userRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser(Role role, boolean active) {
        String uid = UUID.randomUUID().toString().substring(0, 8);
        User user = new User();
        user.setFullName(role.name() + " User " + uid);
        user.setEmail(role.name().toLowerCase() + "." + uid + "@example.test");
        user.setPassword(passwordEncoder.encode("Passw0rd!"));
        user.setRole(role);
        user.setActive(active);
        user.setPasswordChangeRequired(false);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User createUser(Role role, boolean active, boolean passwordChangeRequired, String rawPassword) {
        String uid = UUID.randomUUID().toString().substring(0, 8);
        User user = new User();
        user.setFullName(role.name() + " User " + uid);
        user.setEmail(role.name().toLowerCase() + "." + uid + "@example.test");
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setActive(active);
        user.setPasswordChangeRequired(passwordChangeRequired);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public Student createStudent(String rawPassword) {
        String uid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String studentId = "KT2026" + uid;

        User studentUser = new User();
        studentUser.setFullName("Student " + uid);
        studentUser.setEmail(studentId);
        studentUser.setPassword(passwordEncoder.encode(rawPassword));
        studentUser.setRole(Role.STUDENT);
        studentUser.setActive(true);
        studentUser.setPasswordChangeRequired(true);
        studentUser.setCreatedAt(LocalDateTime.now());
        studentUser.setUpdatedAt(LocalDateTime.now());
        studentUser = userRepository.save(studentUser);

        Student student = new Student();
        student.setStudentId(studentId);
        student.setUser(studentUser);
        student.setBarcode(studentId);
        student.setBatchOrClass("Auto-Batch");
        student.setFullName("Student " + uid);
        student.setFatherName("Father " + uid);
        student.setMotherName("Mother " + uid);
        student.setCenter("KOKUVIL");
        student.setMedium("TAMIL");
        student.setExamBatch(2026);
        student.setParentPhoneNumber("0771234567");
        student.setLanguagePreference("EN");
        student.setAdmissionDate(LocalDate.now());
        student.setStatus(StudentStatus.ACTIVE);
        student.setCreatedAt(LocalDateTime.now());
        student.setUpdatedAt(LocalDateTime.now());
        return studentRepository.save(student);
    }
}
