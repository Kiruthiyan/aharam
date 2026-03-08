package com.aharam.tuition.service;

import com.aharam.tuition.entity.Exam;
import com.aharam.tuition.entity.GradeRule;
import com.aharam.tuition.entity.Mark;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.entity.StudentStatus;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.repository.ExamRepository;
import com.aharam.tuition.repository.GradeRuleRepository;
import com.aharam.tuition.repository.MarkRepository;
import com.aharam.tuition.repository.StudentRepository;
import com.aharam.tuition.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.DoubleSummaryStatistics;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class MarkService {

    @Autowired
    private MarkRepository markRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private GradeRuleRepository gradeRuleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public Exam createExam(Exam exam, Long creatorId) {
        User creator = userRepository.findById(creatorId).orElse(null);

        boolean duplicateExists = examRepository
                .findBySubjectAndBatchAndStatusNot(exam.getSubject(), exam.getBatch(), Exam.ExamStatus.ARCHIVED)
                .stream()
                .anyMatch(existing -> Objects.equals(existing.getName(), exam.getName())
                        && Objects.equals(existing.getExamDate(), exam.getExamDate()));

        if (duplicateExists) {
            throw new IllegalArgumentException("An active exam with the same name, batch, subject, and date already exists.");
        }

        exam.setCreatedBy(creator);
        return examRepository.save(exam);
    }

    public List<Exam> getActiveExamsByBatch(String batch) {
        return examRepository.findByBatchAndStatusNot(batch, Exam.ExamStatus.ARCHIVED);
    }

    @Transactional
    public Mark saveMark(Long examId, String studentId, Double score, String remarks, Long staffId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (student.getStatus() != StudentStatus.ACTIVE) {
            throw new IllegalArgumentException("Cannot enter marks for inactive student.");
        }
        if (!String.valueOf(student.getExamBatch()).equals(exam.getBatch())) {
            throw new IllegalArgumentException("Student does not belong to the selected exam batch.");
        }
        if (score == null || score < 0 || score > exam.getMaxMarks()) {
            throw new IllegalArgumentException("Score must be between 0 and " + exam.getMaxMarks() + ".");
        }

        User staff = userRepository.findById(staffId).orElse(null);

        Mark mark = markRepository.findByExam_IdAndStudent_StudentIdAndDeletedAtIsNull(examId, studentId)
                .orElse(new Mark());

        mark.setExam(exam);
        mark.setStudent(student);
        mark.setMarksObtained(score);
        mark.setRemarks(remarks);
        mark.setEnteredBy(staff);
        mark.setGrade(calculateGrade(score, exam.getMaxMarks()));

        Mark saved = markRepository.save(mark);

        notificationService.sendToUser(
                studentId,
                "Result Published: " + exam.getName(),
                "Your result for " + exam.getSubject() + " is available. Grade: " + saved.getGrade(),
                "ACADEMICS");

        return saved;
    }

    private String calculateGrade(Double score, Double maxMarks) {
        double percentage = (score / maxMarks) * 100;
        List<GradeRule> rules = gradeRuleRepository.findAll();

        if (rules.isEmpty()) {
            if (percentage >= 90) {
                return "A";
            }
            if (percentage >= 75) {
                return "B";
            }
            if (percentage >= 65) {
                return "C";
            }
            if (percentage >= 50) {
                return "S";
            }
            return "F";
        }

        return rules.stream()
                .filter(r -> percentage >= r.getMinPercentage() && percentage <= r.getMaxPercentage())
                .findFirst()
                .map(GradeRule::getGradeLetter)
                .orElse("F");
    }

    @Transactional
    public List<Mark> bulkSaveMarks(Long examId, List<Map<String, Object>> entries, Long staffId) {
        return entries.stream().map(entry -> {
            String sid = (String) entry.get("studentId");
            Double score = Double.valueOf(entry.get("score").toString());
            String remarks = (String) entry.get("remarks");
            return saveMark(examId, sid, score, remarks, staffId);
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getSubjectAnalytics(Long examId) {
        List<Mark> marks = markRepository.findByExam_IdAndDeletedAtIsNull(examId);
        if (marks.isEmpty()) {
            return Collections.emptyMap();
        }

        DoubleSummaryStatistics stats = marks.stream()
                .mapToDouble(Mark::getMarksObtained)
                .summaryStatistics();

        long passCount = marks.stream().filter(m -> !"F".equals(m.getGrade())).count();

        Map<String, Long> gradeDist = marks.stream()
                .collect(Collectors.groupingBy(Mark::getGrade, Collectors.counting()));

        Map<String, Object> response = new HashMap<>();
        response.put("average", stats.getAverage());
        response.put("highest", stats.getMax());
        response.put("lowest", stats.getMin());
        response.put("passPercentage", (double) passCount / marks.size() * 100);
        response.put("totalEntries", (long) marks.size());
        response.put("gradeDistribution", gradeDist);
        return response;
    }

    public List<Mark> getStudentResults(String studentId) {
        return markRepository.findHistoryByStudentId(studentId);
    }
}
