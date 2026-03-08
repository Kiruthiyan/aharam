package com.aharam.tuition.service;

import com.aharam.tuition.dto.StudentRegistrationRequest;
import com.aharam.tuition.dto.StudentUpdateRequest;
import com.aharam.tuition.dto.response.StudentListItemDto;
import com.aharam.tuition.dto.response.StudentPageDto;
import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.entity.StudentStatus;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.exception.BusinessException;
import com.aharam.tuition.repository.StudentRepository;
import com.aharam.tuition.repository.UserRepository;
import com.aharam.tuition.repository.projection.StudentListProjection;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class StudentService {
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public Student registerStudent(StudentRegistrationRequest request) {
        Student student = toStudent(request);
        normalizeStudentFields(student);
        validatePhoneNumbers(student.getParentPhoneNumber(), student.getWhatsappNumber());
        validateEmail(student.getEmail());
        validateStudentNotDuplicate(student, null);

        String newId = generateStudentId(student.getCenter(), student.getMedium(), student.getExamBatch());
        student.setStudentId(newId);

        if (studentRepository.existsById(student.getStudentId())) {
            throw new BusinessException(
                    "Unable to generate a unique student ID. Please retry.",
                    "STUDENT_ID_COLLISION",
                    HttpStatus.CONFLICT);
        }

        student.setAdmissionDate(LocalDate.now());
        student.setStatus(StudentStatus.ACTIVE);
        student.setBarcode(student.getStudentId());
        student.setBatchOrClass("Auto-Batch");
        if (student.getGender() == null || student.getGender().isBlank()) {
            student.setGender("UNSPECIFIED");
        }
        Student savedStudent = studentRepository.save(student);

        String tempPassword = generateTempPassword();
        
        User studentUser = new User();
        studentUser.setFullName(savedStudent.getFullName());
        studentUser.setUsername(savedStudent.getStudentId()); // Student logs in with Student ID
        studentUser.setEmail(savedStudent.getEmail()); // Real email for communication
        studentUser.setPassword(encoder.encode(tempPassword));
        studentUser.setRole(Role.STUDENT);
        studentUser.setActive(true);
        studentUser.setPasswordChangeRequired(true);

        User savedUser = userRepository.save(studentUser);

        savedStudent.setUser(savedUser);
        Student finalSavedStudent = studentRepository.save(savedStudent);
        
        // Send welcome email with temporary password if student has an email
        if (savedStudent.getEmail() != null && !savedStudent.getEmail().isBlank()) {
            emailService.sendWelcomeEmail(savedStudent.getEmail(), tempPassword);
        }
        
        auditLogService.logAction("STUDENT_CREATE", "STUDENT:" + finalSavedStudent.getStudentId(), savedUser.getId());
        return finalSavedStudent;
    }

    @Transactional
    public Student updateStudent(String studentId, StudentUpdateRequest updateRequest) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found."));

        if (updateRequest.getFullName() != null && !updateRequest.getFullName().isBlank()) {
            student.setFullName(updateRequest.getFullName().trim());
        }
        if (updateRequest.getFatherName() != null) {
            student.setFatherName(updateRequest.getFatherName().trim());
        }
        if (updateRequest.getMotherName() != null) {
            student.setMotherName(updateRequest.getMotherName().trim());
        }
        if (updateRequest.getFatherOccupation() != null) {
            student.setFatherOccupation(updateRequest.getFatherOccupation().trim());
        }
        if (updateRequest.getMotherOccupation() != null) {
            student.setMotherOccupation(updateRequest.getMotherOccupation().trim());
        }
        if (updateRequest.getSchoolName() != null) {
            student.setSchoolName(updateRequest.getSchoolName().trim());
        }
        if (updateRequest.getAddress() != null) {
            student.setAddress(updateRequest.getAddress().trim());
        }
        if (updateRequest.getEmail() != null) {
            student.setEmail(updateRequest.getEmail().trim());
        }
        if (updateRequest.getParentPhoneNumber() != null) {
            student.setParentPhoneNumber(updateRequest.getParentPhoneNumber().trim());
        }
        if (updateRequest.getWhatsappNumber() != null) {
            student.setWhatsappNumber(updateRequest.getWhatsappNumber().trim());
        }
        if (updateRequest.getCenter() != null) {
            student.setCenter(updateRequest.getCenter().trim());
        }
        if (updateRequest.getMedium() != null) {
            student.setMedium(updateRequest.getMedium().trim());
        }
        if (updateRequest.getGender() != null && !updateRequest.getGender().isBlank()) {
            student.setGender(updateRequest.getGender().trim());
        }
        if (updateRequest.getExamBatch() != null) {
            student.setExamBatch(updateRequest.getExamBatch());
        }
        if (updateRequest.getSubjects() != null) {
            student.setSubjects(updateRequest.getSubjects().trim());
        }
        if (updateRequest.getStatus() != null) {
            student.setStatus(updateRequest.getStatus());
        }

        normalizeStudentFields(student);
        validatePhoneNumbers(student.getParentPhoneNumber(), student.getWhatsappNumber());
        validateEmail(student.getEmail());
        validateStudentNotDuplicate(student, studentId);

        Student saved = studentRepository.save(student);
        auditLogService.logAction("STUDENT_UPDATE", "STUDENT:" + saved.getStudentId(),
                saved.getUser() != null ? saved.getUser().getId() : null);
        return saved;
    }

    @Transactional
    public Student deactivateStudent(String studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found."));
        student.setStatus(StudentStatus.INACTIVE);

        User user = student.getUser();
        if (user != null) {
            user.setActive(false);
            userRepository.save(user);
        }

        Student updated = studentRepository.save(student);
        auditLogService.logAction("STUDENT_DEACTIVATE", "STUDENT:" + updated.getStudentId(),
                updated.getUser() != null ? updated.getUser().getId() : null);
        return updated;
    }

    @Transactional
    public void softDeleteStudent(String studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found."));
        student.setStatus(StudentStatus.INACTIVE);

        User user = student.getUser();
        if (user != null) {
            user.setActive(false);
            userRepository.save(user);
        }

        Student saved = studentRepository.save(student);
        studentRepository.delete(saved);

        auditLogService.logAction("STUDENT_SOFT_DELETE", "STUDENT:" + studentId,
                user != null ? user.getId() : null);
    }

    public boolean isStudentIdTaken(String studentId) {
        return studentRepository.existsById(studentId);
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(String studentId, boolean includeDeleted) {
        if (includeDeleted) {
            return studentRepository.findAnyByStudentId(studentId)
                    .orElseThrow(() -> new EntityNotFoundException("Student not found."));
        }
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found."));
    }

    public StudentPageDto getStudentsPage(
            String search,
            Integer examBatch,
            String center,
            String status,
            boolean includeDeleted,
            boolean archivedOnly,
            int page,
            int size,
            String sortBy,
            String sortDir) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Sort sort = resolveSort(sortBy, sortDir);
        PageRequest pageRequest = PageRequest.of(safePage, safeSize, sort);

        String normalizedSearch = normalizeText(search);
        String normalizedCenter = normalizeText(center);
        String normalizedStatus = normalizeStatus(status);

        Page<StudentListProjection> paged = studentRepository.findStudentsForList(
                normalizedSearch,
                examBatch,
                normalizedCenter,
                normalizedStatus,
                includeDeleted,
                archivedOnly,
                pageRequest);

        List<StudentListItemDto> content = paged.getContent().stream()
                .map(this::toListItem)
                .toList();

        return StudentPageDto.builder()
                .content(content)
                .page(paged.getNumber())
                .size(paged.getSize())
                .totalElements(paged.getTotalElements())
                .totalPages(paged.getTotalPages())
                .hasNext(paged.hasNext())
                .hasPrevious(paged.hasPrevious())
                .build();
    }

    private StudentListItemDto toListItem(StudentListProjection row) {
        return StudentListItemDto.builder()
                .studentId(row.getStudentId())
                .fullName(row.getFullName())
                .examBatch(row.getExamBatch())
                .center(row.getCenter())
                .medium(row.getMedium())
                .gender(row.getGender())
                .status(row.getStatus())
                .parentPhoneNumber(row.getParentPhoneNumber())
                .email(row.getEmail())
                .createdAt(row.getCreatedAt())
                .updatedAt(row.getUpdatedAt())
                .deletedAt(row.getDeletedAt())
                .deleted(row.getDeletedAt() != null)
                .build();
    }

    private String generateStudentId(String center, String medium, Integer batch) {
        String cCode = "K";
        if ("MALLAKAM".equalsIgnoreCase(center)) {
            cCode = "M";
        }

        String mCode = "T";
        if ("ENGLISH".equalsIgnoreCase(medium)) {
            mCode = "E";
        }

        String prefix = cCode + mCode + batch;
        Student lastStudent = studentRepository.findTopByStudentIdStartingWithOrderByStudentIdDesc(prefix);

        int sequence = 1;
        if (lastStudent != null) {
            String lastId = lastStudent.getStudentId();
            if (lastId.length() > prefix.length()) {
                try {
                    String seqStr = lastId.substring(prefix.length());
                    sequence = Integer.parseInt(seqStr) + 1;
                } catch (NumberFormatException ignored) {
                    sequence = 1;
                }
            }
        }

        return prefix + String.format("%03d", sequence);
    }

    private void validateStudentNotDuplicate(Student student, String excludeStudentId) {
        if (student.getExamBatch() == null || isBlank(student.getCenter())) {
            return;
        }

        String normalizedFullName = normalizeNameForComparison(student.getFullName());
        String normalizedParentPhone = normalizePhoneForComparison(student.getParentPhoneNumber());
        if (normalizedFullName.isBlank() || normalizedParentPhone.isBlank()) {
            return;
        }

        boolean duplicateExists = studentRepository.existsActiveDuplicateStudent(
                student.getExamBatch(),
                student.getCenter(),
                normalizedFullName,
                normalizedParentPhone,
                excludeStudentId);

        if (duplicateExists) {
            throw new BusinessException(
                    "A student with the same name and parent phone already exists in this center and batch.",
                    "DUPLICATE_STUDENT",
                    HttpStatus.BAD_REQUEST);
        }
    }

    private void normalizeStudentFields(Student student) {
        student.setFullName(normalizeText(student.getFullName()));
        student.setFatherName(normalizeText(student.getFatherName()));
        student.setMotherName(normalizeText(student.getMotherName()));
        student.setFatherOccupation(normalizeText(student.getFatherOccupation()));
        student.setMotherOccupation(normalizeText(student.getMotherOccupation()));
        student.setGuardianName(normalizeText(student.getGuardianName()));
        student.setSchoolName(normalizeText(student.getSchoolName()));
        student.setAddress(normalizeText(student.getAddress()));
        student.setSubjects(normalizeText(student.getSubjects()));
        student.setEmail(normalizeEmail(student.getEmail()));
        student.setParentPhoneNumber(normalizePhoneForStorage(student.getParentPhoneNumber()));
        student.setWhatsappNumber(normalizePhoneForStorage(student.getWhatsappNumber()));

        if (!isBlank(student.getCenter())) {
            student.setCenter(student.getCenter().trim().toUpperCase(Locale.ROOT));
        }
        if (!isBlank(student.getMedium())) {
            student.setMedium(student.getMedium().trim().toUpperCase(Locale.ROOT));
        }
        if (!isBlank(student.getGender())) {
            student.setGender(student.getGender().trim().toUpperCase(Locale.ROOT));
        }
    }

    private String normalizeNameForComparison(String value) {
        String normalized = normalizeText(value);
        return normalized == null ? "" : normalized.toLowerCase(Locale.ROOT);
    }

    private String normalizePhoneForComparison(String value) {
        String normalized = normalizePhoneForStorage(value);
        return normalized == null ? "" : normalized.replaceAll("[^0-9]", "");
    }

    private String normalizePhoneForStorage(String value) {
        String normalized = normalizeText(value);
        if (normalized == null || normalized.isBlank()) {
            return normalized;
        }
        return normalized.replaceAll("\\s+", " ");
    }

    private String normalizeEmail(String value) {
        String normalized = normalizeText(value);
        if (normalized == null || normalized.isBlank()) {
            return normalized;
        }
        return normalized.toLowerCase(Locale.ROOT);
    }

    private String normalizeStatus(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        return value.trim().replaceAll("\\s+", " ");
    }

    private void validatePhoneNumbers(String parentPhone, String whatsappPhone) {
        if (isBlank(parentPhone)) {
            throw new BusinessException("Parent phone number is required.", "INVALID_PHONE_FORMAT",
                    HttpStatus.BAD_REQUEST);
        }
        ensurePhoneLength(parentPhone);
        if (!isBlank(whatsappPhone)) {
            ensurePhoneLength(whatsappPhone);
        }
    }

    private void ensurePhoneLength(String phone) {
        String digitsOnly = normalizePhoneForComparison(phone);
        if (digitsOnly.length() < 10 || digitsOnly.length() > 15) {
            throw new BusinessException("Phone number must contain 10 to 15 digits.", "INVALID_PHONE_FORMAT",
                    HttpStatus.BAD_REQUEST);
        }
    }

    private void validateEmail(String email) {
        if (isBlank(email)) {
            return;
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new BusinessException("Please enter a valid email address.", "INVALID_EMAIL_FORMAT",
                    HttpStatus.BAD_REQUEST);
        }
    }

    private Student toStudent(StudentRegistrationRequest request) {
        Student student = new Student();
        student.setFullName(request.getFullName());
        student.setFatherName(request.getFatherName());
        student.setFatherOccupation(request.getFatherOccupation());
        student.setMotherName(request.getMotherName());
        student.setMotherOccupation(request.getMotherOccupation());
        student.setGuardianName(request.getGuardianName());
        student.setSchoolName(request.getSchoolName());
        student.setCenter(request.getCenter());
        student.setMedium(request.getMedium());
        student.setExamBatch(request.getExamBatch());
        student.setGender(request.getGender());
        student.setSubjects(request.getSubjects());
        student.setAddress(request.getAddress());
        student.setEmail(request.getEmail());
        student.setParentPhoneNumber(request.getParentPhoneNumber());
        student.setWhatsappNumber(request.getWhatsappNumber());
        return student;
    }

    private Sort resolveSort(String sortBy, String sortDir) {
        String property = switch (sortBy == null ? "" : sortBy.trim()) {
            case "studentId" -> "student_id";
            case "fullName" -> "full_name";
            case "examBatch" -> "exam_batch";
            case "center" -> "center";
            case "status" -> "status";
            case "createdAt" -> "created_at";
            case "deletedAt" -> "deleted_at";
            default -> "updated_at";
        };
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, property);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isBlank();
    }

    private String generateTempPassword() {
        SecureRandom random = new SecureRandom();
        String upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lower = "abcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String special = "!@#$%^&*";
        String all = upper + lower + digits + special;

        StringBuilder sb = new StringBuilder();
        sb.append(upper.charAt(random.nextInt(upper.length())));
        sb.append(lower.charAt(random.nextInt(lower.length())));
        sb.append(digits.charAt(random.nextInt(digits.length())));
        sb.append(special.charAt(random.nextInt(special.length())));

        for (int i = 0; i < 4; i++) {
            sb.append(all.charAt(random.nextInt(all.length())));
        }

        char[] chars = sb.toString().toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = chars[i];
            chars[i] = chars[j];
            chars[j] = temp;
        }

        sb = new StringBuilder(chars.length);
        for (char c : chars) {
            sb.append(c);
        }
        return sb.toString();
    }
}
