import React, { useEffect, useState, useRef } from 'react';
import { Spin, Alert, Typography, message, Button } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';
import QrScanner from 'qr-scanner';
import api from '../api/axios';

const { Text } = Typography;

function QRScanner({ user }) {
  const videoRef = useRef(null);
  const [scanResult, setScanResult] = useState(() => localStorage.getItem('lastScan') || null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(!scanResult);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !scanning) return;

    let scanLock = false;  // Local synchronous lock

    scannerRef.current = new QrScanner(
      videoRef.current,
      async (result) => {
        if (scanLock) return;  // Prevent immediate duplicates
        scanLock = true;       // Lock immediately

        const scannedData = result.data;

        scannerRef.current.stop(); // Stop scanning after first successful read
        setScanning(false);

        try {
          const res = await api.post(
            `/merchant/scan/${user.id}`,
            { passkitId: scannedData },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }
          );

          setScanResult(scannedData);
          localStorage.setItem('lastScan', scannedData);
          message.success(res.data.message || 'Scan recorded');
          setError(null);

        } catch (err) {
          setError('Scan failed: ' + (err.response?.data?.message || err.message));
        }
      },
      {
        highlightScanRegion: true,
        returnDetailedScanResult: true,
      }
    );

    scannerRef.current.start().catch((err) => {
      setError('Camera access denied or not available: ' + err.message);
      setScanning(false);
    });

    return () => scannerRef.current?.stop();
  }, [user, scanning]);

  const restartScan = () => {
    setScanResult(null);
    setError(null);
    localStorage.removeItem('lastScan');
    setScanning(true);
    scannerRef.current?.start();
  };

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      {scanning ? (
        <Spin tip="Scanning user PassKit QR..." style={{ marginBottom: 16 }}>
          <video
            ref={videoRef}
            style={{ width: '100%', borderRadius: 8, border: '1px solid #d9d9d9' }}
          />
        </Spin>
      ) : scanResult ? (
        <>
          <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: '120px', marginBottom: 16 }} />
          <Text type="success" strong style={{ display: 'block', marginBottom: 16 }}>
            Scanned PassKit ID: {scanResult}
          </Text>
        </>
      ) : (
        <video
          ref={videoRef}
          style={{ width: '100%', borderRadius: 8, border: '1px solid #d9d9d9', marginBottom: 16 }}
          autoPlay
          muted
        />
      )}

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

      {!scanning && (
        <Button onClick={restartScan} type="primary">
          Scan Again
        </Button>
      )}
    </div>
  );
}

export default QRScanner;
