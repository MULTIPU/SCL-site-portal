package com.scl.portal.data

data class Student(
    val id: String,
    val schoolId: String,
    val fullName: String,
    val className: String,
    val gender: String,
    val dateOfBirth: String,
    val parentName: String,
    val parentPhone: String,
    val admissionDate: String
)

data class SubjectScore(
    val code: String,
    val name: String,
    val category: String,
    val testScore: Int,
    val examScore: Int = 0,
    val totalScore: Int,
    val grade: String,
    val remark: String
)

data class StudentResult(
    val id: String,
    val studentId: String,
    val studentName: String,
    val className: String,
    val session: String,
    val term: String,
    val cycleNumber: Int,
    val cycleTitle: String,
    val subjects: List<SubjectScore>,
    val totalScore: Int,
    val maxPossible: Int,
    val average: Double,
    val position: String,
    val totalInClass: Int,
    val teacherRemark: String,
    val principalRemark: String
)

data class AttendanceEntry(
    val studentId: String,
    val studentName: String,
    val className: String,
    val period: Int,
    val status: String // "present", "absent", "late", "excused"
)

data class PaymentRecord(
    val id: String,
    val referenceNumber: String,
    val studentId: String,
    val studentName: String,
    val className: String,
    val amount: Long,
    val purpose: String,
    val payerName: String,
    val datePaid: String,
    val status: String // "pending", "confirmed", "rejected"
)

data class UniformItem(
    val id: String,
    val name: String,
    val category: String,
    val price: Long,
    val description: String
)

object SCLRepository {
    val initialStudents = mutableListOf(
        Student("std-1", "SCLJDP0000", "Johnson Daniel Peters", "JSS 2 Gold", "Male", "2012-05-14", "Engr. Emmanuel Peters", "+234 802 345 6789", "2023-09-11"),
        Student("std-2", "SCLAKB0001", "Adeyemi Kemi Blessing", "SSS 1 Science", "Female", "2010-08-22", "Mrs. Funke Adeyemi", "+234 813 987 6543", "2021-09-13"),
        Student("std-3", "SCLCOA0010", "Chukwuemeka Obinna Alex", "Basic 4 Diamond", "Male", "2015-11-03", "Mr. Kenneth Chukwuemeka", "+234 703 555 1212", "2024-09-09"),
        Student("std-4", "SCLZOE0011", "Zubair Oluwaseun Emmanuel", "SSS 3 Valedictory", "Male", "2008-04-18", "Alhaji Rasheed Zubair", "+234 805 678 1234", "2020-09-14")
    )

    val sampleResult = StudentResult(
        id = "res-1",
        studentId = "SCLJDP0000",
        studentName = "Johnson Daniel Peters",
        className = "JSS 2 Gold",
        session = "2026/2027",
        term = "First Term",
        cycleNumber = 1,
        cycleTitle = "Cycle 1 — First Four-Week Test",
        subjects = listOf(
            SubjectScore("MTH", "Mathematics", "Core", 9, 0, 9, "A1", "Excellent"),
            SubjectScore("ENG", "English Studies", "Core", 8, 0, 8, "B2", "Very Good"),
            SubjectScore("BST", "Basic Science & Tech", "Science", 10, 0, 10, "A1", "Distinction"),
            SubjectScore("CIV", "Civic Education", "Core", 9, 0, 9, "A1", "Excellent"),
            SubjectScore("AGR", "Agricultural Science", "Vocational", 8, 0, 8, "B2", "Very Good"),
            SubjectScore("CMP", "Computer Studies", "Vocational", 10, 0, 10, "A1", "Distinction")
        ),
        totalScore = 54,
        maxPossible = 60,
        average = 90.0,
        position = "2nd",
        totalInClass = 28,
        teacherRemark = "Daniel shows disciplined scholarship and high leadership acumen.",
        principalRemark = "Keep reaching for highest academic laurels."
    )

    val attendanceMap = mutableMapOf<String, String>(
        "SCLJDP0000" to "present",
        "SCLAKB0001" to "present",
        "SCLCOA0010" to "late",
        "SCLZOE0011" to "present"
    )

    val payments = mutableListOf(
        PaymentRecord("pay-1", "ZEN-20261019-9821", "SCLJDP0000", "Johnson Daniel Peters", "JSS 2 Gold", 145000, "Tuition & Development Package", "Engr. Emmanuel Peters", "2026-10-15", "confirmed"),
        PaymentRecord("pay-2", "FBN-20261018-4412", "SCLAKB0001", "Adeyemi Kemi Blessing", "SSS 1 Science", 32000, "Uniform & Laboratory Set", "Mrs. Funke Adeyemi", "2026-10-18", "pending")
    )

    val uniforms = listOf(
        UniformItem("u1", "Primary Boys Complete Uniform", "Uniform", 18500, "Shirt, shorts & school crest"),
        UniformItem("u2", "Primary Girls Pinafore & Shirt", "Uniform", 19500, "Pleated maroon pinafore"),
        UniformItem("u3", "Secondary College Blazer", "Uniform", 26000, "Deep maroon tailored blazer"),
        UniformItem("u4", "Inter-House Sportswear Set", "Sportswear", 15000, "Athletic polo & tracksuit"),
        UniformItem("u5", "Embroidered School Cardigan", "Accessories", 12500, "Knitwear with gold striped trim"),
        UniformItem("u6", "60-Leaves Custom Exercise Books (10pk)", "Books", 6500, "High quality ruled school books")
    )

    fun generateSchoolId(fullName: String, seq: Int): String {
        val clean = fullName.replace(Regex("[^A-Za-z ]"), "").trim()
        val words = clean.split(Regex("\\s+")).filter { it.isNotEmpty() }
        var inits = words.map { it.first().uppercaseChar() }.joinToString("").take(4)
        if (inits.isEmpty()) inits = "SCL"
        val binStr = if (seq < 16) seq.toString(2).padStart(4, '0') else (2000 + (seq - 16)).toString()
        return "SCL$inits$binStr"
    }
}
