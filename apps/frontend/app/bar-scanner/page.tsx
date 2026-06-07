"use client";

import { useState } from "react";
import BarcodeScanner from "@/components/BarcodeScanner";

export default function ScannerPage() {
  const [barcode, setBarcode] = useState<string | null>(null);
  const [scannerActive, setScannerActive] = useState(true);

  const handleScan = (value: string) => {
    setBarcode(value);
    setScannerActive(false);
  };

  const handleTryAgain = () => {
    setBarcode(null);
    setScannerActive(true);
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Product Barcode Scanner</h1>

      {scannerActive && (
        <BarcodeScanner active={scannerActive} onScan={handleScan} />
      )}

      {barcode && (
        <div className="space-y-4 rounded-lg border p-4">
          <h2 className="font-semibold">Scan Successful</h2>

          <p>
            <strong>Barcode:</strong> {barcode}
          </p>

          <button
            onClick={handleTryAgain}
            className="rounded bg-black px-4 py-2 text-white"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
