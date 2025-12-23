package com.aharam.tuition.repository;

import com.aharam.tuition.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, String> {
}
