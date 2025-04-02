import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";

const ScanQRCode = () => {
  const [scanning, setScanning] = useState(false);
  const [qrResult, setQrResult] = useState("");
  const [selectedCamera, setSelectedCamera] = useState("");
  const [cameras, setCameras] = useState([]);
  const scannerInstance = useRef(null);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices.length > 0) {
          setCameras(devices);
          setSelectedCamera(devices[0].id); // Default to first camera
        } else {
          console.warn("No cameras found");
        }
      })
      .catch((err) => console.error("Camera Error:", err));
  }, []);

  const startScanning = () => {
    if (!selectedCamera) {
      alert("No camera selected");
      return;
    }

    // ✅ Stop any existing scanner before starting a new one
    if (scannerInstance.current) {
      stopScanning();
    }

    scannerInstance.current = new Html5Qrcode("qr-scanner");

    scannerInstance.current.start(
      selectedCamera,
      {
        fps: 10,
        qrbox: { width: 300, height: 300 }, // ✅ Increased QR box size
        disableFlip: false, // ✅ Improves detection on some cameras
        aspectRatio: 1.5, // ✅ Helps with detection
        rememberLastUsedCamera: true,
      },
      (decodedText) => {
        console.log("✅ QR Code Scanned: ", decodedText);
        setQrResult(decodedText);
        stopScanning(); // Stop scanning after successful detection
        markAttendance(decodedText);
        document.getElementById("qr-error").innerText = "";
      },
      (error) => {
        // ✅ Show error only once and filter repetitive logs
        if (error.name === "NotFoundException") {
          document.getElementById("qr-error").innerText =
            "⚠️ No QR Code detected. Please try again.";
        } else {
          console.error("QR Scanner Error:", error.message);
        }
      }
    );

    setScanning(true);
  };

  const stopScanning = () => {
    if (scannerInstance.current) {
      scannerInstance.current.stop()
        .then(() => {
          scannerInstance.current.clear();
          scannerInstance.current = null;
          console.log("🚀 Scanner Stopped Successfully");
        })
        .catch((err) => console.error("Error stopping scanner:", err));
    }
    setScanning(false);
  };

  const markAttendance = async (employeeId) => {
    console.log("🔄 Sending scanned ID to backend:", employeeId);
    try {
      const response = await axios.post(
        "https://qr-code-attendance-backend2.onrender.com/api/mark_attendance/",
        { employee_id: employeeId }
      );
      console.log("✅ Attendance API Response:", response.data);
      alert(response.data.message || "Attendance Marked!");
    } catch (error) {
      console.error("Attendance API Error:", error.response ? error.response.data : error);
      alert("❌ Failed to mark attendance. Check console for details.");
    }
  };

  return (
    <div className="scanner-container" style={{ textAlign: "center" }}>
      <h2>Scan Employee QR Code</h2>

      <div id="qr-scanner" className="scanner-box" style={{ width: "350px", height: "350px", margin: "auto" }}></div>
      <p id="qr-error" style={{ color: "red", fontWeight: "bold" }}></p>

      {!scanning && cameras.length > 0 && (
        <div className="camera-selection">
          <label>Select Camera: </label>
          <select
            onChange={(e) => setSelectedCamera(e.target.value)}
            value={selectedCamera}
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="scanner-buttons">
        {!scanning ? (
          <button onClick={startScanning} className="start-btn">
            Start Scanning
          </button>
        ) : (
          <button onClick={stopScanning} className="stop-btn">
            Stop Scanning
          </button>
        )}
      </div>

      {qrResult && <p>Scanned QR Code: {qrResult}</p>}
    </div>
  );
};

export default ScanQRCode;
