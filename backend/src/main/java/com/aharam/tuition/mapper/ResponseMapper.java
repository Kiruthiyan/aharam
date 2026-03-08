package com.aharam.tuition.mapper;

import com.aharam.tuition.dto.response.AttendanceSummaryDto;
import com.aharam.tuition.dto.response.ExamResponseDto;
import com.aharam.tuition.dto.response.FeeLogDto;
import com.aharam.tuition.dto.response.FeeStatusDto;
import com.aharam.tuition.dto.response.MarkEntryResponseDto;
import com.aharam.tuition.dto.response.NoticeResponseDto;
import com.aharam.tuition.dto.response.StaffResponseDto;
import com.aharam.tuition.dto.response.StudentDetailDto;
import com.aharam.tuition.dto.response.StudentSummaryDto;
import com.aharam.tuition.entity.Attendance;
import com.aharam.tuition.entity.Exam;
import com.aharam.tuition.entity.Fee;
import com.aharam.tuition.entity.FeeLog;
import com.aharam.tuition.entity.Mark;
import com.aharam.tuition.entity.Notice;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.entity.User;

public final class ResponseMapper {
    private ResponseMapper() {
    }

    public static StaffResponseDto toStaff(User user) {
        return StaffResponseDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .active(user.isActive())
                .passwordChangeRequired(user.isPasswordChangeRequired())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public static StudentSummaryDto toStudentSummary(Student student) {
        return StudentSummaryDto.builder()
                .studentId(student.getStudentId())
                .fullName(student.getFullName())
                .fatherName(student.getFatherName())
                .motherName(student.getMotherName())
                .fatherOccupation(student.getFatherOccupation())
                .motherOccupation(student.getMotherOccupation())
                .schoolName(student.getSchoolName())
                .examBatch(student.getExamBatch())
                .batchOrClass(student.getBatchOrClass())
                .center(student.getCenter())
                .medium(student.getMedium())
                .gender(student.getGender())
                .email(student.getEmail())
                .address(student.getAddress())
                .status(student.getStatus() != null ? student.getStatus().name() : null)
                .parentPhoneNumber(student.getParentPhoneNumber())
                .whatsappNumber(student.getWhatsappNumber())
                .admissionDate(student.getAdmissionDate())
                .build();
    }

    public static StudentDetailDto toStudentDetail(Student student) {
        return StudentDetailDto.builder()
                .studentId(student.getStudentId())
                .fullName(student.getFullName())
                .fatherName(student.getFatherName())
                .motherName(student.getMotherName())
                .fatherOccupation(student.getFatherOccupation())
                .motherOccupation(student.getMotherOccupation())
                .schoolName(student.getSchoolName())
                .center(student.getCenter())
                .medium(student.getMedium())
                .gender(student.getGender())
                .examBatch(student.getExamBatch())
                .subjects(student.getSubjects())
                .address(student.getAddress())
                .email(student.getEmail())
                .parentPhoneNumber(student.getParentPhoneNumber())
                .whatsappNumber(student.getWhatsappNumber())
                .status(student.getStatus() != null ? student.getStatus().name() : null)
                .admissionDate(student.getAdmissionDate())
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }

    public static AttendanceSummaryDto toAttendance(Attendance attendance) {
        return AttendanceSummaryDto.builder()
                .id(attendance.getId())
                .studentId(attendance.getStudent() != null ? attendance.getStudent().getStudentId() : null)
                .studentName(attendance.getStudent() != null ? attendance.getStudent().getFullName() : null)
                .date(attendance.getDate())
                .status(attendance.getStatus() != null ? attendance.getStatus().name() : null)
                .method(attendance.getMethod() != null ? attendance.getMethod().name() : null)
                .batchOrClass(attendance.getBatchOrClass())
                .center(attendance.getCenter())
                .time(attendance.getTime())
                .teacherNotes(attendance.getTeacherNotes())
                .markedById(attendance.getMarkedBy() != null ? attendance.getMarkedBy().getId() : null)
                .createdAt(attendance.getCreatedAt())
                .build();
    }

    public static FeeStatusDto toFeeStatus(Fee fee) {
        return FeeStatusDto.builder()
                .id(fee.getId())
                .studentId(fee.getStudent() != null ? fee.getStudent().getStudentId() : null)
                .studentName(fee.getStudent() != null ? fee.getStudent().getFullName() : null)
                .academicYear(fee.getAcademicYear())
                .month(fee.getMonth())
                .status(fee.getStatus() != null ? fee.getStatus().name() : null)
                .updateMethod(fee.getUpdateMethod() != null ? fee.getUpdateMethod().name() : null)
                .updatedById(fee.getUpdatedBy() != null ? fee.getUpdatedBy().getId() : null)
                .createdAt(fee.getCreatedAt())
                .updatedAt(fee.getUpdatedAt())
                .build();
    }

    public static FeeLogDto toFeeLog(FeeLog feeLog) {
        return FeeLogDto.builder()
                .id(feeLog.getId())
                .feeId(feeLog.getFee() != null ? feeLog.getFee().getId() : null)
                .oldStatus(feeLog.getOldStatus() != null ? feeLog.getOldStatus().name() : null)
                .newStatus(feeLog.getNewStatus() != null ? feeLog.getNewStatus().name() : null)
                .method(feeLog.getMethod() != null ? feeLog.getMethod().name() : null)
                .changedById(feeLog.getChangedBy() != null ? feeLog.getChangedBy().getId() : null)
                .changedAt(feeLog.getChangedAt())
                .build();
    }

    public static MarkEntryResponseDto toMarkEntry(Mark mark) {
        return MarkEntryResponseDto.builder()
                .id(mark.getId())
                .examId(mark.getExam() != null ? mark.getExam().getId() : null)
                .examName(mark.getExam() != null ? mark.getExam().getName() : null)
                .subject(mark.getExam() != null ? mark.getExam().getSubject() : null)
                .studentId(mark.getStudent() != null ? mark.getStudent().getStudentId() : null)
                .studentName(mark.getStudent() != null ? mark.getStudent().getFullName() : null)
                .marksObtained(mark.getMarksObtained())
                .grade(mark.getGrade())
                .remarks(mark.getRemarks())
                .enteredById(mark.getEnteredBy() != null ? mark.getEnteredBy().getId() : null)
                .createdAt(mark.getCreatedAt())
                .updatedAt(mark.getUpdatedAt())
                .build();
    }

    public static ExamResponseDto toExam(Exam exam) {
        return ExamResponseDto.builder()
                .id(exam.getId())
                .name(exam.getName())
                .batch(exam.getBatch())
                .subject(exam.getSubject())
                .maxMarks(exam.getMaxMarks())
                .examDate(exam.getExamDate())
                .status(exam.getStatus() != null ? exam.getStatus().name() : null)
                .createdById(exam.getCreatedBy() != null ? exam.getCreatedBy().getId() : null)
                .createdAt(exam.getCreatedAt())
                .build();
    }

    public static NoticeResponseDto toNotice(Notice notice) {
        return NoticeResponseDto.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .message(notice.getMessage())
                .audience(notice.getAudience())
                .channel(notice.getChannel())
                .sentBy(notice.getSentBy())
                .sentByRole(notice.getSentByRole())
                .at(notice.getAt())
                .status(notice.getStatus())
                .whatsappCount(notice.getWhatsappCount())
                .createdAt(notice.getCreatedAt())
                .build();
    }
}
