"use client";

import React, { useState } from "react";
import QrScanner from "@/components/QrScanner";

export default function App() {
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleScanSuccess = (decodedText: string) => {
    console.log("QR Result:", decodedText);

    setScanResult(decodedText);
  };

  const handleScanError = (err: string) => {
    console.error(err);
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <h1>QR Scanner</h1>

      {scanResult ? (
        <div>
          <p>
            <strong>Scanned:</strong> {scanResult}
          </p>

          <button onClick={() => setScanResult(null)}>Scan Again</button>
        </div>
      ) : (
        <QrScanner
          fps={20}
          qrbox={{
            width: 300,
            height: 300,
          }}
          disableFlip={false}
          qrCodeSuccessCallback={handleScanSuccess}
          qrCodeErrorCallback={handleScanError}
        />
      )}
    </div>
  );
}
