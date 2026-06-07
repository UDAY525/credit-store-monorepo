"use client";

import React, { useEffect, useRef } from "react";
import type { Html5QrcodeScanner } from "html5-qrcode";

interface QrScannerProps {
  fps?: number;
  qrbox?: number | { width: number; height: number };
  aspectRatio?: number;
  disableFlip?: boolean;
  qrCodeSuccessCallback: (decodedText: string, decodedResult: unknown) => void;
  qrCodeErrorCallback?: (errorMessage: string) => void;
}

const qrcodeRegionId = "html5qr-code-full-region";

export const QrScanner: React.FC<QrScannerProps> = (props) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initScanner() {
      const { Html5QrcodeScanner } = await import("html5-qrcode");

      const config: {
        fps: number;
        qrbox: number | { width: number; height: number };
        aspectRatio?: number;
        disableFlip?: boolean;
      } = {
        fps: props.fps ?? 10,
        qrbox: props.qrbox ?? {
          width: 300,
          height: 300,
        },
      };

      if (props.aspectRatio !== undefined) {
        config.aspectRatio = props.aspectRatio;
      }

      if (props.disableFlip !== undefined) {
        config.disableFlip = props.disableFlip;
      }

      if (!isMounted) return;

      const scanner = new Html5QrcodeScanner(qrcodeRegionId, config, false);

      scannerRef.current = scanner;

      scanner.render(props.qrCodeSuccessCallback, (errorMessage) => {
        const message = String(errorMessage);

        if (
          !message.includes(
            "No MultiFormat Readers were able to detect the code",
          )
        ) {
          props.qrCodeErrorCallback?.(message);
        }
      });
    }

    void initScanner();

    return () => {
      isMounted = false;

      if (scannerRef.current) {
        void scannerRef.current.clear().catch(console.error);
      }
    };
  }, [
    props.fps,
    props.qrbox,
    props.aspectRatio,
    props.disableFlip,
    props.qrCodeSuccessCallback,
    props.qrCodeErrorCallback,
  ]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <div id={qrcodeRegionId} />
    </div>
  );
};

export default QrScanner;
