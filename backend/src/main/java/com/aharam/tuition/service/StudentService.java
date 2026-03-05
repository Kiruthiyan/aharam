package com.aharam.tuition.service;

import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.entity.StudentStatus;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.repository.StudentRepository;
import com.aharam.tuition.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Transactional
    public Student registerStudent(Student student) throws Exception {
        // Auto-Generate Student ID
        String newId = generateStudentId(student.getCenter(), student.getMedium(), student.getExamBatch());
        student.setStudentId(newId);

        if (studentRepository.existsById(student.getStudentId())) {
            // Fallback or retry logic if collision, but synchronized/transactional should
            // handle it
            // For now, simpler error is fine as volume is low
            throw new Exception("Error generating ID, please try again.");
        }

        // 1. Initial Student Save Setup
        student.setAdmissionDate(LocalDate.now());
        student.setStatus(StudentStatus.ACTIVE);
        student.setBarcode(student.getStudentId()); // Barcode fallback
        student.setBatchOrClass("Auto-Batch");
        Student savedStudent = studentRepository.save(student);

        // 2. Create Student User Account
        // Email = StudentID@student.aharam.com
        // Password = FullName (Temporary)
        User studentUser = new User();
        studentUser.setFullName(savedStudent.getFullName());
        studentUser.setEmail(savedStudent.getStudentId()); // Login ID is now just the Student ID
        studentUser.setPassword(encoder.encode(savedStudent.getFullName().toLowerCase())); // Default password (lowercase)
        studentUser.setRole(Role.STUDENT);
        studentUser.setActive(true);
        studentUser.setPasswordChangeRequired(true);

        User savedUser = userRepository.save(studentUser);

        savedStudent.setUser(savedUser);
        studentRepository.save(savedStudent);

        return savedStudent;
    }

    public boolean isStudentIdTaken(String studentId) {
        return studentRepository.existsById(studentId);
    }

    public java.util.List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    private String generateStudentId(String center, String medium, Integer batch) {
        String cCode = "K"; // Default Kokuvil
        if ("MALLAKAM".equalsIgnoreCase(center))
            cCode = "M";

        String mCode = "T"; // Default Tamil
        if ("ENGLISH".equalsIgnoreCase(medium))
            mCode = "E";

        String prefix = cCode + mCode + batch; // e.g., KT2026

        Student lastStudent = studentRepository.findTopByStudentIdStartingWithOrderByStudentIdDesc(prefix);

        int sequence = 1;
        if (lastStudent != null) {
            String lastId = lastStudent.getStudentId();
            // Remove prefix to get sequence
            // Assuming format KT2026xxx
            // Prefix length = 1 + 1 + 4 = 6
            if (lastId.length() > prefix.length()) {
                try {
                    String seqStr = lastId.substring(prefix.length());
                    sequence = Integer.parseInt(seqStr) + 1;
                } catch (NumberFormatException e) {
                    // unexpected format, restart from 1? or log?
                    sequence = 1;
                }
            }
        }

        // Format: Prefix + 3 digit sequence (001, 002...)
        return prefix + String.format("%03d", sequence);
    }
}
