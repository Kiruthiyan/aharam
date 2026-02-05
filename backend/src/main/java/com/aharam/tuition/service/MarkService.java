package com.aharam.tuition.service;

import com.aharam.tuition.entity.Mark;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.repository.MarkRepository;
import com.aharam.tuition.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MarkService {

    @Autowired
    private MarkRepository markRepository;

    @Autowired
    private StudentRepository studentRepository;

    public Mark addMark(String studentId, String examName, String subject, Double score, Double maxScore) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Mark mark = new Mark();
        mark.setStudent(student);
        mark.setExamName(examName);
        mark.setSubject(subject);
        mark.setScore(score);
        mark.setMaxScore(maxScore);
        mark.setDate(LocalDate.now());

        // Simple Grade Logic
        double percentage = (score / maxScore) * 100;
        if (percentage >= 75)
            mark.setGrade("A");
        else if (percentage >= 65)
            mark.setGrade("B");
        else if (percentage >= 50)
            mark.setGrade("C");
        else if (percentage >= 35)
            mark.setGrade("S");
        else
            mark.setGrade("F");

        return markRepository.save(mark);
    }

    public List<Mark> getStudentMarks(String studentId) {
        return markRepository.findByStudent_StudentId(studentId);
    }

    public List<Mark> getAllMarks() {
        return markRepository.findAll();
    }

    public List<Mark> bulkAddMarks(List<com.aharam.tuition.controller.MarkController.MarkRequest> requests) {
        return requests.stream()
                .map(req -> addMark(req.getStudentId(), req.getExamName(), req.getSubject(), req.getScore(),
                        req.getMaxScore()))
                .collect(java.util.stream.Collectors.toList());
    }

    public List<Mark> getMarksByBatch(String examName, Integer batch) {
        return markRepository.findByExamNameAndStudent_ExamBatch(examName, batch);
    }
}
