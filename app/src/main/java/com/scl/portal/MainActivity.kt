package com.scl.portal

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.scl.portal.data.*
import com.scl.portal.ui.theme.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            var isDarkTheme by remember { mutableStateOf(false) }
            SCLPortalTheme(darkTheme = isDarkTheme) {
                MainAppScreen(
                    isDarkTheme = isDarkTheme,
                    onToggleTheme = { isDarkTheme = !isDarkTheme }
                )
            }
        }
    }
}

enum class SCLTab(val label: String) {
    HOME("Home"),
    RESULTS("Results"),
    ATTENDANCE("Attendance"),
    FEES("Fees & Store"),
    ADMIN("Admin Portal")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScreen(isDarkTheme: Boolean, onToggleTheme: () -> Unit) {
    var selectedTab by remember { mutableStateOf(SCLTab.HOME) }
    var currentRole by remember { mutableStateOf("Parent") }
    var showWhatsAppDialog by remember { mutableStateOf(false) }
    var showAnthemDialog by remember { mutableStateOf(false) }
    var showAdmissionDialog by remember { mutableStateOf(false) }
    var showRoleMenu by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = SclDarkMaroon,
                    titleContentColor = Color.White
                ),
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(SclGold),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                "SCL",
                                fontWeight = FontWeight.Black,
                                fontSize = 11.sp,
                                color = SclDarkMaroon
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                "SHINING CHILD LEADERS",
                                fontWeight = FontWeight.Black,
                                fontSize = 14.sp,
                                letterSpacing = 0.5.sp
                            )
                            Text(
                                "Epe, Lagos • Raising Tomorrow's Leaders",
                                fontSize = 10.sp,
                                color = SclLightGold
                            )
                        }
                    }
                },
                actions = {
                    IconButton(onClick = { showAnthemDialog = true }) {
                        Icon(Icons.Default.MusicNote, contentDescription = "Play Anthem", tint = SclLightGold)
                    }
                    IconButton(onClick = { showWhatsAppDialog = true }) {
                        Icon(Icons.Default.QuestionAnswer, contentDescription = "Helpdesk", tint = Color(0xFF2FE27A))
                    }
                    IconButton(onClick = onToggleTheme) {
                        Icon(
                            if (isDarkTheme) Icons.Default.LightMode else Icons.Default.DarkMode,
                            contentDescription = "Toggle Theme",
                            tint = SclLightGold
                        )
                    }
                    Box {
                        TextButton(
                            onClick = { showRoleMenu = true },
                            colors = ButtonDefaults.textButtonColors(contentColor = SclGold)
                        ) {
                            Text(currentRole, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                        DropdownMenu(
                            expanded = showRoleMenu,
                            onDismissRequest = { showRoleMenu = false }
                        ) {
                            listOf("Parent", "Student", "Teacher", "Management Admin", "Technical Admin", "Developer").forEach { role ->
                                DropdownMenuItem(
                                    text = { Text(role, fontSize = 12.sp, fontWeight = if (role == currentRole) FontWeight.Bold else FontWeight.Normal) },
                                    onClick = {
                                        currentRole = role
                                        showRoleMenu = false
                                    }
                                )
                            }
                        }
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = SclDarkMaroon,
                contentColor = Color.White
            ) {
                SCLTab.entries.forEach { tab ->
                    val isSelected = selectedTab == tab
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { selectedTab = tab },
                        icon = {
                            when (tab) {
                                SCLTab.HOME -> Icon(if (isSelected) Icons.Filled.Home else Icons.Outlined.Home, contentDescription = tab.label)
                                SCLTab.RESULTS -> Icon(if (isSelected) Icons.Filled.EmojiEvents else Icons.Outlined.EmojiEvents, contentDescription = tab.label)
                                SCLTab.ATTENDANCE -> Icon(if (isSelected) Icons.Filled.CheckCircle else Icons.Outlined.CheckCircle, contentDescription = tab.label)
                                SCLTab.FEES -> Icon(if (isSelected) Icons.Filled.AccountBalanceWallet else Icons.Outlined.AccountBalanceWallet, contentDescription = tab.label)
                                SCLTab.ADMIN -> Icon(if (isSelected) Icons.Filled.AdminPanelSettings else Icons.Outlined.AdminPanelSettings, contentDescription = tab.label)
                            }
                        },
                        label = { Text(tab.label, fontSize = 10.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = SclDarkMaroon,
                            selectedTextColor = SclGold,
                            indicatorColor = SclGold,
                            unselectedIconColor = Color.White.copy(alpha = 0.7f),
                            unselectedTextColor = Color.White.copy(alpha = 0.7f)
                        )
                    )
                }
            }
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAdmissionDialog = true },
                containerColor = SclGold,
                contentColor = SclDarkMaroon,
                shape = RoundedCornerShape(16.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "New Admission")
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (selectedTab) {
                SCLTab.HOME -> HomeScreen(
                    onCheckResults = { selectedTab = SCLTab.RESULTS },
                    onMarkAttendance = { selectedTab = SCLTab.ATTENDANCE },
                    onPayFees = { selectedTab = SCLTab.FEES },
                    onEnroll = { showAdmissionDialog = true },
                    onPlayAnthem = { showAnthemDialog = true }
                )
                SCLTab.RESULTS -> ResultsScreen()
                SCLTab.ATTENDANCE -> AttendanceScreen()
                SCLTab.FEES -> FeesStoreScreen()
                SCLTab.ADMIN -> AdminScreen(
                    currentRole = currentRole,
                    onOpenAdmission = { showAdmissionDialog = true }
                )
            }
        }
    }

    if (showWhatsAppDialog) {
        WhatsAppDialog(onDismiss = { showWhatsAppDialog = false })
    }
    if (showAnthemDialog) {
        AnthemDialog(onDismiss = { showAnthemDialog = false })
    }
    if (showAdmissionDialog) {
        AdmissionDialog(onDismiss = { showAdmissionDialog = false })
    }
}

@Composable
fun HomeScreen(
    onCheckResults: () -> Unit,
    onMarkAttendance: () -> Unit,
    onPayFees: () -> Unit,
    onEnroll: () -> Unit,
    onPlayAnthem: () -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Hero Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SclMaroon),
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        "2026/2027 ACADEMIC SESSION",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = SclGold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "Shining Child Leaders School",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                    Text(
                        "Excellence in scholarship, character & discipline. Day Care to SSS 3.",
                        fontSize = 12.sp,
                        color = Color.White.copy(alpha = 0.9f)
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = onEnroll,
                            colors = ButtonDefaults.buttonColors(containerColor = SclGold, contentColor = SclDarkMaroon),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Admissions Open", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                        OutlinedButton(
                            onClick = onCheckResults,
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color.White),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Check Results", fontSize = 12.sp)
                        }
                    }
                }
            }
        }

        // Census Statistics
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    CensusItem("420+", "Pupils")
                    CensusItem("38", "Teachers")
                    CensusItem("16", "Classes")
                    CensusItem("100%", "WAEC Pass")
                }
            }
        }

        // Quick Navigation Grid
        item {
            Text("Core Portals", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                QuickActionCard("Results Check", "Cycle 1-4 marks", Icons.Default.EmojiEvents, Modifier.weight(1f), onCheckResults)
                QuickActionCard("Roll Call", "Mark attendance", Icons.Default.CheckCircle, Modifier.weight(1f), onMarkAttendance)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                QuickActionCard("Fees & Store", "Slip verify & uniform", Icons.Default.AccountBalanceWallet, Modifier.weight(1f), onPayFees)
                QuickActionCard("School Anthem", "Song & chimes", Icons.Default.MusicNote, Modifier.weight(1f), onPlayAnthem)
            }
        }

        // Leadership Prefects
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SclSand),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Prefects & Student Council", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = SclDarkMaroon)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("• Head Boy: Zubair Oluwaseun Emmanuel (SSS 3)", fontSize = 12.sp, color = Color(0xFF260C0D))
                    Text("• Head Girl: Adeyemi Kemi Blessing (SSS 1)", fontSize = 12.sp, color = Color(0xFF260C0D))
                    Text("• Senior Prefect: Johnson Daniel Peters (JSS 2)", fontSize = 12.sp, color = Color(0xFF260C0D))
                    Text("• Sports Captain: Chukwuemeka Obinna Alex (Basic 4)", fontSize = 12.sp, color = Color(0xFF260C0D))
                }
            }
        }
    }
}

@Composable
fun CensusItem(number: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(number, fontSize = 18.sp, fontWeight = FontWeight.Black, color = SclMaroon)
        Text(label, fontSize = 10.sp, color = Color.Gray, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun QuickActionCard(title: String, subtitle: String, icon: androidx.compose.ui.graphics.vector.ImageVector, modifier: Modifier, onClick: () -> Unit) {
    Card(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier.size(36.dp).clip(CircleShape).background(SclSand),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = title, tint = SclMaroon, modifier = Modifier.size(20.dp))
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(title, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                Text(subtitle, fontSize = 10.sp, color = Color.Gray)
            }
        }
    }
}

@Composable
fun ResultsScreen() {
    var searchId by remember { mutableStateOf("SCLJDP0000") }
    var result by remember { mutableStateOf<StudentResult?>(SCLRepository.sampleResult) }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("Continuous Assessment & Results", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = SclMaroon)
            Text("Cycle 1 to 4 Four-Week Test Assessment", fontSize = 11.sp, color = Color.Gray)
        }

        item {
            Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                Column(modifier = Modifier.padding(14.dp)) {
                    OutlinedTextField(
                        value = searchId,
                        onValueChange = { searchId = it.uppercase() },
                        label = { Text("Enter SCL Binary ID (e.g. SCLJDP0000)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(
                        onClick = {
                            result = if (searchId == "SCLJDP0000") SCLRepository.sampleResult else null
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = SclMaroon),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Search & Verify Result", color = SclGold, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        if (result != null) {
            val r = result!!
            item {
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(r.studentName, fontWeight = FontWeight.Black, fontSize = 15.sp, color = SclMaroon)
                                Text("${r.studentId} • ${r.className}", fontSize = 11.sp, color = Color.Gray)
                            }
                            Text("Rank: ${r.position}", fontWeight = FontWeight.Bold, color = SclGold, fontSize = 13.sp)
                        }

                        Divider(modifier = Modifier.padding(vertical = 10.dp))

                        // Subject List
                        r.subjects.forEach { sub ->
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(sub.name, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Text("${sub.totalScore}/10", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    Text(sub.grade, fontSize = 12.sp, fontWeight = FontWeight.Black, color = SclMaroon)
                                }
                            }
                        }

                        Divider(modifier = Modifier.padding(vertical = 10.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Total: ${r.totalScore}/${r.maxPossible}", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            Text("Average: ${r.average}%", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF126B3A))
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        Text("Teacher: ${r.teacherRemark}", fontSize = 11.sp, fontStyle = androidx.compose.ui.text.font.FontStyle.Italic, color = Color.Gray)
                    }
                }
            }
        } else {
            item {
                Text("No result record found for $searchId in current cycle.", fontSize = 12.sp, color = Color.Red)
            }
        }
    }
}

@Composable
fun AttendanceScreen() {
    val attendance = remember { mutableStateMapOf<String, String>().apply { putAll(SCLRepository.attendanceMap) } }
    var notification by remember { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item {
            Text("Student Attendance Register", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = SclMaroon)
            Text("Period 0 (Morning Class Roll Call) & Secondary Periods", fontSize = 11.sp, color = Color.Gray)
            if (notification.isNotEmpty()) {
                Text(notification, color = Color(0xFF126B3A), fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }

        items(SCLRepository.initialStudents) { student ->
            val status = attendance[student.schoolId] ?: "present"
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(student.fullName, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Text("${student.schoolId} • ${student.className}", fontSize = 10.sp, color = Color.Gray)
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        listOf("present", "late", "absent").forEach { st ->
                            val isCurrent = status == st
                            Button(
                                onClick = {
                                    attendance[student.schoolId] = st
                                    notification = "Marked ${student.fullName} as $st"
                                },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isCurrent) SclMaroon else SclSand,
                                    contentColor = if (isCurrent) SclGold else SclDarkMaroon
                                ),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(st.capitalize(), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FeesStoreScreen() {
    var activeTab by remember { mutableStateOf(0) } // 0 = Schedule, 1 = Uniform Store
    var message by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("School Fees & Materials", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = SclMaroon)
        Spacer(modifier = Modifier.height(8.dp))

        TabRow(selectedTabIndex = activeTab, containerColor = SclSand, contentColor = SclMaroon) {
            Tab(selected = activeTab == 0, onClick = { activeTab = 0 }) {
                Text("Bank Transfer & Fees", modifier = Modifier.padding(10.dp), fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
            Tab(selected = activeTab == 1, onClick = { activeTab = 1 }) {
                Text("Uniform Catalogue", modifier = Modifier.padding(10.dp), fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (message.isNotEmpty()) {
            Text(message, color = Color(0xFF126B3A), fontSize = 12.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
        }

        if (activeTab == 0) {
            Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = SclMaroon)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Official School Account Details", fontWeight = FontWeight.Bold, color = SclGold, fontSize = 13.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Bank: Zenith Bank PLC", color = Color.White, fontSize = 12.sp)
                    Text("Account Name: SHINING CHILD LEADERS SCHOOL", color = Color.White, fontSize = 12.sp)
                    Text("Account No: 1014589201", color = SclLightGold, fontSize = 16.sp, fontWeight = FontWeight.Black, fontFamily = FontFamily.Monospace)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("Include student name & SCL ID in transfer narration.", color = Color.White.copy(alpha = 0.8f), fontSize = 10.sp)
                }
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(SCLRepository.uniforms) { item ->
                    Card(
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(item.name, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                Text(item.description, fontSize = 10.sp, color = Color.Gray)
                                Text("₦${item.price}", fontWeight = FontWeight.Black, color = SclMaroon, fontSize = 12.sp)
                            }
                            Button(
                                onClick = { message = "Added ${item.name} to school bursary order." },
                                colors = ButtonDefaults.buttonColors(containerColor = SclMaroon),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Order", fontSize = 11.sp, color = SclGold)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AdminScreen(currentRole: String, onOpenAdmission: () -> Unit) {
    val canApprove = currentRole in listOf("Management Admin", "Technical Admin", "Developer")
    var feedback by remember { mutableStateOf("") }

    LazyColumn(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("Administrative Portal ($currentRole)", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = SclMaroon)
            if (!canApprove) {
                Text("Read-only mode. Switch persona in top bar to Management Admin to approve payments.", fontSize = 11.sp, color = Color.Red)
            }
            if (feedback.isNotEmpty()) {
                Text(feedback, color = Color(0xFF126B3A), fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }

        item {
            Button(
                onClick = onOpenAdmission,
                colors = ButtonDefaults.buttonColors(containerColor = SclGold, contentColor = SclDarkMaroon),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Enroll / Register New Pupil (SCL Binary ID)", fontWeight = FontWeight.Bold)
            }
        }

        item {
            Text("Payment Approvals Ledger", fontSize = 13.sp, fontWeight = FontWeight.Bold)
        }

        items(SCLRepository.payments) { pay ->
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(pay.referenceNumber, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        Text(pay.status.uppercase(), fontWeight = FontWeight.Black, fontSize = 10.sp, color = if (pay.status == "confirmed") Color(0xFF126B3A) else Color(0xFFB8860B))
                    }
                    Text("${pay.studentName} (${pay.studentId}) • ₦${pay.amount}", fontSize = 12.sp)
                    Text("Payer: ${pay.payerName} on ${pay.datePaid}", fontSize = 10.sp, color = Color.Gray)

                    if (pay.status == "pending" && canApprove) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = {
                                    val idx = SCLRepository.payments.indexOf(pay)
                                    if (idx >= 0) {
                                        SCLRepository.payments[idx] = pay.copy(status = "confirmed")
                                        feedback = "Approved payment ${pay.referenceNumber}."
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF126B3A)),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Approve Payment", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun WhatsAppDialog(onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("SCL WhatsApp Helpdesk", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = SclMaroon) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Select department contact:", fontSize = 12.sp)
                Text("• Parents Official Group: +234 802 345 6789", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Text("• School Management & Accounts: +234 802 345 6789", fontSize = 11.sp)
                Text("• Student Affairs & Discipline: +234 813 987 6543", fontSize = 11.sp)
                Text("• Technical Portal Support: +234 703 555 1212", fontSize = 11.sp)
                Text("• Email: shiningchildleader@gmail.com", fontSize = 11.sp, color = SclMaroon)
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) { Text("Close") }
        }
    )
}

@Composable
fun AnthemDialog(onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("SCL School Anthem", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = SclMaroon) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("\"Raising Today's Children to Become Tomorrow's Leaders\"", fontStyle = androidx.compose.ui.text.font.FontStyle.Italic, fontSize = 11.sp, color = SclGold)
                Text("Arise, oh children of the light,", fontSize = 12.sp)
                Text("In truth and knowledge we shall stand.", fontSize = 12.sp)
                Text("With discipline and moral might,", fontSize = 12.sp)
                Text("To lead and build our blessed land.", fontSize = 12.sp)
                Spacer(modifier = Modifier.height(4.dp))
                Text("Chorus:", fontWeight = FontWeight.Bold, fontSize = 11.sp)
                Text("Shining Child Leaders, shining so bright,", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text("Guided by wisdom, champions of right!", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) { Text("Done") }
        }
    )
}

@Composable
fun AdmissionDialog(onDismiss: () -> Unit) {
    var name by remember { mutableStateOf("") }
    var className by remember { mutableStateOf("JSS 1 Bronze") }
    var generatedId by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("New Pupil Admission", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = SclMaroon) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Pupil Full Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = className,
                    onValueChange = { className = it },
                    label = { Text("Target Class") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                if (generatedId.isNotEmpty()) {
                    Card(colors = CardDefaults.cardColors(containerColor = SclSand), shape = RoundedCornerShape(10.dp)) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("Allocated SCL Binary ID:", fontSize = 10.sp, color = Color.Gray)
                            Text(generatedId, fontSize = 16.sp, fontWeight = FontWeight.Black, color = SclMaroon, fontFamily = FontFamily.Monospace)
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (name.isNotEmpty()) {
                        val newId = SCLRepository.generateSchoolId(name, SCLRepository.initialStudents.size)
                        generatedId = newId
                        SCLRepository.initialStudents.add(
                            Student("std-${System.currentTimeMillis()}", newId, name, className, "Male", "2015-01-01", "Parent", "+234 800 000 0000", "2026-10-19")
                        )
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = SclMaroon)
            ) {
                Text("Generate ID & Enroll", color = SclGold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Close") }
        }
    )
}
