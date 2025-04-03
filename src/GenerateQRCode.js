import React, { useState } from "react";
import axios from "axios";
import "./styles.css";

const GenerateQRCode = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [error, setError] = useState("");

  // ✅ Correct API URL
  const API_URL = "https://qr-code-attendance-backend2.onrender.com/api/register/";

  const handleGenerateQR = async () => {
    try {
      const response = await axios.post(
        API_URL,  // ✅ Correct API URL
        {
          employee_id: employeeId,
          name: name,
          department: department,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // ✅ Important for authentication & cookies
        }
      );

      if (response.data.qr_code) {
        setQrUrl(`https://qr-code-attendance-backend2.onrender.com${response.data.qr_code}`);
        setError(""); // Clear error if request is successful
      } else {
        setError("QR Code not received.");
      }
    } catch (error) {
      console.error("Error generating QR:", error.response?.data || error.message);
      setError("Error generating QR. Please try again.");
    }
  };

  return (
    <div className="container">
      <h2>Generate QR Code</h2>
      <input
        type="text"
        placeholder="Employee ID"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Department"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      />
      <button onClick={handleGenerateQR}>Generate QR Code</button>
      {qrUrl && <img src={qrUrl} alt="QR Code" />}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default GenerateQRCode;
