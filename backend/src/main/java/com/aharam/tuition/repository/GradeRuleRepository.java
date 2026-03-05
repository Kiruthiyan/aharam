package com.aharam.tuition.repository;

import com.aharam.tuition.entity.GradeRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GradeRuleRepository extends JpaRepository<GradeRule, Long> {
}
