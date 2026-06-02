<!-- <?php
// // ១. អនុញ្ញាតឱ្យ React App (ទោះនៅ Port ផ្សេងគ្នា) អាចផ្ញើទិន្នន័យចូលមកបាន (CORS)
// header("Access-Control-Allow-Origin: *");
// header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
// header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // កែប្រែត្រង់ចំណុចនេះ
// header("Content-Type: application/json; charset=UTF-8");

// // បន្ថែមការត្រួតពិនិត្យ OPTIONS Request (Preflight) សម្រាប់ជៀសវាងបញ្ហា CORS នៅលើ Browser ខ្លះ
// if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
//     exit(0);
// }

// // ២. ភ្ជាប់ទៅកាន់ MySQL Database (ឈ្មោះ host, username, password, ឈ្មោះ database)
// $conn = new mysqli("localhost", "root", "", "school_db");

// // ពិនិត្យមើលថា តើការភ្ជាប់ទៅ Database ជោគជ័យឬទេ?
// if ($conn->connect_error) {
//     die(json_encode(["status" => "error", "message" => "ការភ្ជាប់ទៅ Database បានបរាជ័យ"]));
// }

// // ៣. ចាប់យកទិន្នន័យ JSON ដែលសិស្សផ្ញើមកពី React
// $data = json_decode(file_get_contents("php://input"), true);

// // ពិនិត្យថា តើទិន្នន័យមានឈ្មោះ និង ID សិស្សមកជាមួយដែរឬទេ?
// if (!empty($data['id']) && !empty($data['name'])) {
//     // ប្រើប្រាស់ real_escape_string ដើម្បីការពារការវាយប្រហារ SQL Injection (សុវត្ថិភាពទិន្នន័យ)
//     $id = $conn->real_escape_string($data['id']);
//     $name = $conn->real_escape_string($data['name']);
//     $date = $conn->real_escape_string($data['date']);
//     $time = $conn->real_escape_string($data['time']);

//     // ៤. សរសេរពាក្យបញ្ជា SQL ដើម្បីបញ្ចូលទិន្នន័យទៅក្នុង Table ឈ្មោះ attendance
//     $sql = "INSERT INTO attendance (student_id, name, date, time) VALUES ('$id', '$name', '$date', '$time')";
    
//     // ប្រសិនបើបញ្ចូលជោគជ័យ វានឹងឆ្លើយតបទៅ React វិញថា "success"
//     if ($conn->query($sql) === TRUE) {
//         echo json_encode(["status" => "success", "message" => "កត់ត្រាវត្តមានជោគជ័យ"]);
//     } else {
//         echo json_encode(["status" => "error", "message" => "មានបញ្ហាក្នុងការបញ្ចូលទិន្នន័យ: " . $conn->error]);
//     }
// } else {
//     // ករណីសិស្សផ្ញើទិន្នន័យមកទទេរ ឬមិនគ្រប់គ្រាន់
//     echo json_encode(["status" => "error", "message" => "ទិន្នន័យមិនត្រឹមត្រូវ ឬមិនគ្រប់គ្រាន់"]);
// }

// // បិទការភ្ជាប់ទៅកាន់ Database
// $conn->close();
// ?> -->

<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$conn = new mysqli("localhost", "root", "", "school_db");

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "ការភ្ជាប់ទៅ Database បរាជ័យ"]));
}

$data = json_decode(file_get_contents("php://input"), true);

// 🎯 កែសម្រួល៖ ត្រួតពិនិត្យ និងចាប់យក ID សិស្សឱ្យបានហ្មត់ចត់ (ការពារករណី Key ឆ្លាស់គ្នា)
$student_id = "";
if (!empty($data['id'])) {
    $student_id = $conn->real_escape_string($data['id']);
} elseif (!empty($data['student_id'])) {
    $student_id = $conn->real_escape_string($data['student_id']);
}

if (!empty($student_id) && !empty($data['name'])) {
    $name = $conn->real_escape_string($data['name']);
    $gender = !empty($data['gender']) ? $conn->real_escape_string($data['gender']) : 'ប្រុស';
    
    // 🎯 គន្លឹះដោះស្រាយ៖ ចាប់យកទាំង 'type' ឬ 'attendanceType' ពី React ដើម្បីការពារកុំឱ្យបាត់តម្លៃ
    $type = 'present'; 
    if (!empty($data['type'])) {
        $type = $data['type'];
    } elseif (!empty($data['attendanceType'])) {
        $type = $data['attendanceType'];
    }
    
    $type = $conn->real_escape_string($type);

    // កំណត់តម្លៃសម្រាប់ការកើនឡើង
    $p_add = ($type === 'present') ? 1 : 0;
    $a_add = ($type === 'absent') ? 1 : 0;

    /* បើមិនទាន់មាន ID វានឹង INSERT បើមានហើយ វានឹង UPDATE បូកកើន ១ ភ្លាមៗ */
    $sql = "INSERT INTO attendance (student_id, name, gender, present_count, absent_count) 
            VALUES ('$student_id', '$name', '$gender', $p_add, $a_add)
            ON DUPLICATE KEY UPDATE 
            name = '$name',
            gender = '$gender',
            present_count = present_count + $p_add,
            absent_count = absent_count + $a_add,
            last_scan = CURRENT_TIMESTAMP()"; // បច្ចុប្បន្នភាពថ្ងៃស្កេនចុងក្រោយ
    
    if ($conn->query($sql) === TRUE) {
        $msg = ($type === 'present') ? "កត់ត្រាវត្តមាន (+1) ជោគជ័យ" : "កត់ត្រាអវត្តមាន (+1) ជោគជ័យ";
        echo json_encode(["status" => "success", "message" => $msg]);
    } else {
        echo json_encode(["status" => "error", "message" => "កំហុស MySQL: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "ទិន្នន័យមិនគ្រប់គ្រាន់"]);
}

$conn->close();
?>