<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "school_db");

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed"]));
}

// ទាញទិន្នន័យវត្តមាន ដោយតម្រៀបពីអ្នកមកថ្មីបំផុតនៅខាងលើ
// $sql = "SELECT * FROM attendance ORDER BY id DESC";
//===ដម្រៀបតាម ID សិស្សពីថ្មីទៅចាស់
// $sql = "SELECT * FROM attendance ORDER BY last_scan DESC";
//==ដម្រៀបតាម ID សិស្សពីតូចទៅធំ
$sql = "SELECT * FROM attendance ORDER BY student_id ASC";
$result = $conn->query($sql);

$attendance_list = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $attendance_list[] = $row;
    }
}

echo json_encode(["status" => "success", "data" => $attendance_list]);

$conn->close();
?>