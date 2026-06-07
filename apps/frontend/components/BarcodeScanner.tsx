"use client";

import { useState } from "react";
import BarcodeScanner from "react-qr-barcode-scanner";

export default function ProductScanner() {
  const [barcode, setBarcode] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {scanning && (
        <div className="w-full max-w-md overflow-hidden rounded-lg border">
          <BarcodeScanner
            width={500}
            height={500}
            onUpdate={(err, result) => {
              if (err || !result) return;

              const value = result.getText();

              setBarcode(value);
              setScanning(false);
            }}
          />
        </div>
      )}

      {barcode && (
        <div className="w-full max-w-md rounded-lg border bg-green-50 p-4 text-center">
          <p className="text-sm text-gray-500">Decoded Barcode</p>

          <p className="mt-2 text-xl font-bold">{barcode}</p>

          <button
            onClick={() => {
              setBarcode(null);
              setScanning(true);
            }}
            className="mt-4 rounded bg-black px-4 py-2 text-white"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
