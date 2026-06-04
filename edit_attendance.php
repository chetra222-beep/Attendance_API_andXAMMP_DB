<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "school_db");

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed"]));
}

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['student_id'])) {
    $student_id = $conn->real_escape_string($data['student_id']);
    $present = intval($data['present_count']);
    $absent = intval($data['absent_count']);

    // ធ្វើបច្ចុប្បន្នភាពទៅលើលេខវត្តមាន និងអវត្តមានចំៗ
    $sql = "UPDATE attendance SET present_count = $present, absent_count = $absent WHERE student_id = '$student_id'";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "បានកែសម្រួលជោគជ័យ"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "ទិន្នន័យមិនគ្រប់គ្រាន់"]);
}

$conn->close();
?>