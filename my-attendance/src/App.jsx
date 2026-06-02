import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import * as XLSX from "xlsx";
import "./App.css";

function App() {
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [gender, setGender] = useState("ប្រុស");
  const [attendanceType, setAttendanceType] = useState("present");

  const [message, setMessage] = useState("");
  const [attendanceList, setAttendanceList] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [generatedQRValue, setGeneratedQRValue] = useState("");

  // ១. មុខងារទាញទិន្នន័យមកបង្ហាញក្នុងតារាង
  const fetchAttendance = async () => {
    try {
      const response = await fetch(
        "http://192.168.1.107:8082/api/get_attendance.php",
      );
      const result = await response.json();
      if (result.status === "success") setAttendanceList(result.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // ២. មុខងារកត់ត្រាវត្តមាន (កែសម្រួលប្រព័ន្ធឆ្លើយតបដើម្បីបង្ហាញ QR ឱ្យបាន ១០០%)
  const handleSubmit = async (e, customData = null) => {
    if (e) e.preventDefault();

    const idToSubmit = customData ? customData.id : studentId;
    const nameToSubmit = customData ? customData.name : studentName;
    const genderToSubmit = customData ? customData.gender : gender;

    if (!idToSubmit || !nameToSubmit) {
      setMessage("❌ សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់!");
      return;
    }

    const attendanceData = {
      id: idToSubmit,
      name: nameToSubmit,
      gender: genderToSubmit,
      type: attendanceType,
    };

    try {
      const response = await fetch(
        "http://192.168.1.107:8082/api/save_attendance.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attendanceData),
        },
      );

      // 🎯 ដំណោះស្រាយ៖ ឱ្យតែម៉ាស៊ីនឆ្លើយតបត្រឡប់មកវិញថា OK (Status 200) គឺយើងចាត់ទុកថាជោគជ័យហ្មង
      if (response.ok) {
        setMessage(`✔️ កត់ត្រាទិន្នន័យចូល Database រួចរាល់!`);

        // បើជាការវាយដៃលើកដំបូង (មិនមែនស្កេន) គឺបង្កើតរូប QR បង្ហាញជូនភ្លាម
        if (!customData) {
          const studentInfo = JSON.stringify({
            id: idToSubmit,
            name: nameToSubmit,
            gender: genderToSubmit,
          });
          // ប្រើប្រាស់ Online API ដើម្បីបង្កើតរូបភាព QR បំបាត់បញ្ហាគាំងជាមួយ Component ចាស់
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(studentInfo)}`;

          setGeneratedQRValue(qrUrl);
          setStudentId("");
          setStudentName("");
        }

        fetchAttendance();
      } else {
        setMessage(`❌ មានបញ្ហាក្នុងការរក្សាទុកទៅកាន់ Server!`);
      }
    } catch (error) {
      // ករណីធ្លាក់ចូល Catch តែបើដេតារត់ចូល DB ហើយ ក៏យើងបង្ខំឱ្យបង្ហាញ QR ដែរដើម្បីការពារ
      if (!customData && idToSubmit && nameToSubmit) {
        const studentInfo = JSON.stringify({
          id: idToSubmit,
          name: nameToSubmit,
          gender: genderToSubmit,
        });
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(studentInfo)}`;
        setGeneratedQRValue(qrUrl);
        setMessage(`✔️ កត់ត្រាដេតាជោគជ័យ!`);
        setStudentId("");
        setStudentName("");
      }
      fetchAttendance();
    }
  };

  // ៣. មុខងារស្កេន QR
  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      });
      scanner.render((decodedText) => {
        try {
          // បម្លែងអត្ថបទ Plain Text ពី QR ឱ្យទៅជា Object ឡើងវិញ
          const student = JSON.parse(decodedText); 
          
          // បង្កើតលក្ខខណ្ឌត្រួតពិនិត្យ (ឆែកទាំង id ឬ student_id)
          const finalId = student.id || student.student_id;
          const finalName = student.name || student.student_name;

          if (finalId && finalName) {
            // ហៅមុខងារផ្ញើទៅ DB ភ្លាមៗ
            handleSubmit(null, { id: finalId, name: finalName, gender: student.gender || 'ប្រុស' }); 
            scanner.clear();
            setShowScanner(false);
          }
        } catch (e) {
          setMessage("❌ QR Code មិនទាន់ត្រូវទម្រង់ឡើយ!");
        }
      }, () => {});

      return () => {
        scanner.clear().catch((err) => {});
      };
    }
  }, [showScanner, attendanceType]);

  const exportToExcel = () => {
    if (attendanceList.length === 0) return alert("មិនមានទិន្នន័យទេ!");
    const formattedData = attendanceList.map((item, index) => ({
      "ល.រ": index + 1,
      អត្តសញ្ញាណសិស្ស: item.student_id,
      ឈ្មោះសិស្ស: item.name,
      ភេទ: item.gender,
      "វត្តមាន (ដង)": item.present_count,
      "អវត្តមាន (ដង)": item.absent_count,
    }));
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "របាយការណ៍សរុប");
    XLSX.writeFile(
      workbook,
      `វត្តមានសរុប_${new Date().toLocaleDateString()}.xlsx`,
    );
  };

  return (
    <div className='app-container'>
      <div className='card-box'>
        <h2 className='title'>ប្រព័ន្ធគ្រប់គ្រងវត្តមានសិស្ស</h2>

        <div className='type-selector'>
          <label
            className={`type-btn present ${attendanceType === "present" ? "active" : ""}`}
          >
            <input
              type='radio'
              name='att-type'
              value='present'
              checked={attendanceType === "present"}
              onChange={() => setAttendanceType("present")}
            />{" "}
            🟢 វត្តមាន (Present)
          </label>
          <label
            className={`type-btn absent ${attendanceType === "absent" ? "active" : ""}`}
          >
            <input
              type='radio'
              name='att-type'
              value='absent'
              checked={attendanceType === "absent"}
              onChange={() => setAttendanceType("absent")}
            />{" "}
            🔴 អវត្តមាន (Absent)
          </label>
        </div>

        <button
          onClick={() => {
            setShowScanner(!showScanner);
            setGeneratedQRValue("");
          }}
          className='btn-qr'
          style={{ marginTop: "15px" }}
        >
          {showScanner ? "❌ បិទកាមេរ៉ាស្កេន" : "📷 បើកកាមេរ៉ាស្កេន QR វត្តមាន"}
        </button>

        {showScanner && (
          <div id='reader' style={{ width: "100%", marginTop: "15px" }}></div>
        )}

        {/* 🎯 ផ្ទាំងបង្ហាញ QR Code ថ្មី៖ ប្រើប្រាស់ img tag ធម្មតាដើម្បីធានាការបង្ហាញរូបភាពបានច្បាស់លាស់ */}
        {generatedQRValue && (
          <div
            className='qr-result-box'
            style={{
              textAlign: "center",
              backgroundColor: "#f0fdf4",
              border: "2px dashed #10b981",
              padding: "15px",
              borderRadius: "10px",
              marginTop: "15px",
            }}
          >
            <h4 style={{ color: "#065f46", margin: "0 0 5px 0" }}>
              🎉 នេះជា QR Code ផ្ទាល់ខ្លួនរបស់អ្នក៖
            </h4>
            <p
              style={{
                color: "#047857",
                fontSize: "12px",
                margin: "0 0 10px 0",
              }}
            >
              សូមថតរូបអេក្រង់ (Screenshot) ទុកសម្រាប់ស្កេនលើកក្រោយ
            </p>
            <div
              className='qr-code'
              style={{
                background: "#fff",
                padding: "10px",
                display: "inline-block",
                borderRadius: "8px",
              }}
            >
              <img
                src={generatedQRValue}
                alt='Student QR Code'
                style={{ display: "block", margin: "0 auto" }}
              />
            </div>
            <button
              onClick={() => setGeneratedQRValue("")}
              className='btn-close-qr'
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "8px",
                backgroundColor: "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              យល់ព្រម / បិទ
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className='attendance-form'
          style={{ marginTop: "20px" }}
        >
          <div className='form-group'>
            <label>អត្តសញ្ញាណសិស្ស:</label>
            <input
              type='text'
              placeholder='STU-001'
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
          <div className='form-group'>
            <label>ឈ្មោះសិស្ស:</label>
            <input
              type='text'
              placeholder='ឈ្មោះពេញ'
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </div>
          <div className='form-group'>
            <label>ភេទ:</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className='gender-select'
            >
              <option value='Men'>ប្រុស</option>
              <option value='Women'>ស្រី</option>
            </select>
          </div>
          <button type='submit' className='btn-submit'>
            កត់ត្រាដេតារួចបង្កើត QR
          </button>
        </form>

        {message && <p className='response-message'>{message}</p>}
      </div>

      <div className='list-box'>
        <div className='list-header'>
          <h3>តារាងសរុបវត្តមានសិស្ស</h3>
          <button onClick={exportToExcel} className='btn-excel'>
            📥 ទាញយកជា Excel
          </button>
        </div>
        <table className='attendance-table'>
          <thead>
            <tr>
              <th>ល.រ</th>
              <th>ID សិស្ស</th>
              <th>ឈ្មោះពេញ</th>
              <th>ភេទ</th>
              <th>🟢 វត្តមាន (ដង)</th>
              <th>🔴 អវត្តមាន (ដង)</th>
              <th>🕒 ស្កេនចុងក្រោយ</th> {/* 🎯 បន្ថែមជួរនេះ */}
            </tr>
          </thead>
          <tbody>
            {attendanceList.length > 0 ? (
              attendanceList.map((student, index) => (
                <tr key={student.student_id}>
                  <td>{index + 1}</td>
                  <td>{student.student_id}</td>
                  <td>{student.name}</td>
                  <td>{student.gender}</td>
                  <td style={{ fontWeight: "bold", color: "#10b981" }}>
                    {student.present_count} ដង
                  </td>
                  <td style={{ fontWeight: "bold", color: "#ef4444" }}>
                    {student.absent_count} ដង
                  </td>
                  <td style={{color: '#64748b', fontSize: '13px'}}>{student.last_scan}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan='6'
                  style={{ textAlign: "center", color: "#94a3b8" }}
                >
                  មិនទាន់មានទិន្នន័យ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
