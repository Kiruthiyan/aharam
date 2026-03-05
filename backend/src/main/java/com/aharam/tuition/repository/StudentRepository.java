package com.aharam.tuition.repository;

import com.aharam.tuition.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, String> {
    Student findTopByStudentIdStartingWithOrderByStudentIdDesc(String prefix);

    java.util.Optional<Student> findByUserEmail(String email);
    java.util.Optional<Student> findByBarcode(String barcode);
}
