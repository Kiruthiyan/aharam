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
        if (studentRepository.existsById(student.getStudentId())) {
            throw new Exception("Student ID already exists!");
        }

        // 1. Save Student Record
        student.setAdmissionDate(LocalDate.now());
        student.setStatus(StudentStatus.ACTIVE);
        Student savedStudent = studentRepository.save(student);

        // 2. Create Parent User Account
        // Username = StudentID
        // Password = FullName (Temporary)
        User parentUser = new User();
        parentUser.setUsername(savedStudent.getStudentId());
        parentUser.setPassword(encoder.encode(savedStudent.getFullName())); // Default password
        parentUser.setRole(Role.PARENT);
        parentUser.setRelatedId(savedStudent.getStudentId());

        userRepository.save(parentUser);

        return savedStudent;
    }

    public boolean isStudentIdTaken(String studentId) {
        return studentRepository.existsById(studentId);
    }
}
