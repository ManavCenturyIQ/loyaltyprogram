import React from 'react';
import { Typography } from 'antd';
import QRScanner from './QRScanner';
import { useLocation } from 'react-router-dom';

const { Title } = Typography;

function Scanner() {
    const location = useLocation();
    const user = location.state?.user;
  if (!user) return <p className="text-center text-red-500">User not logged in</p>;

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded shadow">
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        Scan User’s PassKit Wallet
      </Title>
      <QRScanner user={user} />
    </div>
  );
}

export default Scanner;
