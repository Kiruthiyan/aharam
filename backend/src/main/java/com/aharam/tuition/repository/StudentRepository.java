package com.aharam.tuition.repository;

import com.aharam.tuition.entity.StudentStatus;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.repository.projection.StudentListProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, String> {
    Student findTopByStudentIdStartingWithOrderByStudentIdDesc(String prefix);

    Optional<Student> findByUserEmail(String email);
    Optional<Student> findByBarcode(String barcode);

    @Query(value = "SELECT * FROM students s WHERE s.student_id = :studentId", nativeQuery = true)
    Optional<Student> findAnyByStudentId(@Param("studentId") String studentId);

    @Query(value = """
            SELECT EXISTS(
                SELECT 1
                FROM students s
                WHERE s.deleted_at IS NULL
                  AND s.exam_batch = :examBatch
                  AND upper(trim(s.center)) = upper(trim(:center))
                  AND lower(trim(s.full_name)) = lower(trim(:fullName))
                  AND regexp_replace(s.parent_phone_number, '[^0-9]', '', 'g') = :parentPhoneDigits
                  AND (:excludeStudentId IS NULL OR s.student_id <> :excludeStudentId)
            )
            """, nativeQuery = true)
    boolean existsActiveDuplicateStudent(
            @Param("examBatch") Integer examBatch,
            @Param("center") String center,
            @Param("fullName") String fullName,
            @Param("parentPhoneDigits") String parentPhoneDigits,
            @Param("excludeStudentId") String excludeStudentId);

    @Query(value = """
            SELECT
                s.student_id AS studentId,
                s.full_name AS fullName,
                s.exam_batch AS examBatch,
                s.center AS center,
                s.medium AS medium,
                s.gender AS gender,
                s.status AS status,
                s.parent_phone_number AS parentPhoneNumber,
                s.email AS email,
                s.created_at AS createdAt,
                s.updated_at AS updatedAt,
                s.deleted_at AS deletedAt
            FROM students s
            WHERE (:includeDeleted = true OR s.deleted_at IS NULL)
              AND (:archivedOnly = false OR s.deleted_at IS NOT NULL)
              AND (:examBatch IS NULL OR s.exam_batch = :examBatch)
              AND (:center IS NULL OR upper(trim(s.center)) = upper(trim(:center)))
              AND (:status IS NULL OR upper(trim(coalesce(s.status, ''))) = upper(trim(:status)))
              AND (
                    :search IS NULL OR :search = ''
                    OR lower(s.full_name) LIKE lower(concat('%', :search, '%'))
                    OR lower(s.student_id) LIKE lower(concat('%', :search, '%'))
                    OR regexp_replace(coalesce(s.parent_phone_number, ''), '[^0-9]', '', 'g')
                       LIKE concat('%', regexp_replace(:search, '[^0-9]', '', 'g'), '%')
              )
            """, countQuery = """
            SELECT count(*)
            FROM students s
            WHERE (:includeDeleted = true OR s.deleted_at IS NULL)
              AND (:archivedOnly = false OR s.deleted_at IS NOT NULL)
              AND (:examBatch IS NULL OR s.exam_batch = :examBatch)
              AND (:center IS NULL OR upper(trim(s.center)) = upper(trim(:center)))
              AND (:status IS NULL OR upper(trim(coalesce(s.status, ''))) = upper(trim(:status)))
              AND (
                    :search IS NULL OR :search = ''
                    OR lower(s.full_name) LIKE lower(concat('%', :search, '%'))
                    OR lower(s.student_id) LIKE lower(concat('%', :search, '%'))
                    OR regexp_replace(coalesce(s.parent_phone_number, ''), '[^0-9]', '', 'g')
                       LIKE concat('%', regexp_replace(:search, '[^0-9]', '', 'g'), '%')
              )
            """, nativeQuery = true)
    Page<StudentListProjection> findStudentsForList(
            @Param("search") String search,
            @Param("examBatch") Integer examBatch,
            @Param("center") String center,
            @Param("status") String status,
            @Param("includeDeleted") boolean includeDeleted,
            @Param("archivedOnly") boolean archivedOnly,
            Pageable pageable);

    long countByStatus(StudentStatus status);

    @Query("SELECT COUNT(s) FROM Student s WHERE upper(trim(coalesce(s.gender, ''))) IN ('MALE', 'M')")
    long countMaleStudents();

    @Query("SELECT COUNT(s) FROM Student s WHERE upper(trim(coalesce(s.gender, ''))) IN ('FEMALE', 'F')")
    long countFemaleStudents();

    @Query("SELECT COUNT(DISTINCT s.examBatch) FROM Student s WHERE s.examBatch IS NOT NULL")
    long countDistinctBatches();

    @Query("SELECT COUNT(DISTINCT upper(trim(s.center))) FROM Student s WHERE s.center IS NOT NULL AND trim(s.center) <> ''")
    long countDistinctCenters();

    @Query("SELECT s.studentId FROM Student s WHERE s.createdBy.id = :createdById")
    List<String> findStudentIdsByCreator(@Param("createdById") Long createdById);

    @Query("SELECT s.studentId FROM Student s")
    List<String> findAllStudentIds();

    @Query("SELECT s FROM Student s WHERE upper(trim(s.batchOrClass)) = upper(trim(:batchOrClass)) AND s.status = :status")
    List<Student> findByBatchOrClassIgnoreCaseAndStatus(
            @Param("batchOrClass") String batchOrClass,
            @Param("status") StudentStatus status);
}
