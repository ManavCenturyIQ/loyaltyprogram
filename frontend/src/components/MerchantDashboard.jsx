import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Card,
  message,
  Spin,
  Empty,
  Table,
  Row,
  Col,

} from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  MailOutlined,
  UserOutlined,
  BarcodeOutlined,
  StarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

function MerchantDashboard({ user }) {
  
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    if (user?.tierId) {
      api
        .get(`/merchant/${user.tierId}/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((res) => setUsers(res.data))
        .catch(() => message.error('Failed to load users'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center mt-20">
        <Text type="danger">User not logged in</Text>
      </div>
    );
  }

  const userColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text || 'Unnamed User',
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
    },
  ];

  const filteredUsers = users.filter((u) => u.points >= 10 && u.points % 10 === 0);

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded shadow">
      <Title level={2} className="text-center mb-8">Merchant Dashboard</Title>
      
      <Row gutter={[24, 24]}>
        {/* Left Column - Merchant Info */}
        <Col xs={24} md={8}>
          <Card bordered title="Merchant Info">
            <p><UserOutlined /> <Text strong>Tier Name:</Text> {user.tierName || 'N/A'}</p>
            <p><MailOutlined /> <Text strong>Email:</Text> {user.email}</p>
            <p><BarcodeOutlined /> <Text strong>Tier ID:</Text> {user.tierId || 'N/A'}</p>
            <p><StarOutlined /> <Text strong>Scans Count:</Text> {user.scansCount || 0}</p>
            {user?.qrCode && (
              <p>
                <BarcodeOutlined /> <Text strong>Quick Share QR:</Text><br />
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(user.qrCode)}`}
                  alt="Quick Share QR"
                  style={{ marginTop: 8, width: 150 }}
                />
              </p>
            )}
          </Card>

          <div className="text-center mt-6">
            <Button
              style={{ marginTop: '20px' }}
              type="primary"
              size="large"
              block
              onClick={() => navigate('/scanner', { state: { user } })}
            >
              Go to QR Scanner
            </Button>
          </div>
          <Card title="All registered users" style={{ marginTop: '20px' }}>
            {users.length === 0 ? (
              <Empty description="No users available" />
            ) : (
              <Table
                dataSource={users}
                columns={userColumns}
                rowKey="_id"
                pagination={false}
                size="small"
              />
            )}
          </Card>
        </Col>

        {/* Right Column - Users in Cards */}
        <Col xs={24} md={16}>
          <Title level={4}>Users Eligible for Free Coffee</Title>

          {loading ? (
            <div className="text-center my-10">
              <Spin size="large" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <Empty description="No users found for this tier" className="my-10" />
          ) : (
            <Row gutter={[16, 16]}>
              {filteredUsers.map((u) => (
                <Col xs={24} sm={6} key={u.email}>
                  <Card bordered hoverable title={u.name || 'Unnamed User'} style={{ background: '#99de99' }}>
                    <p><StarOutlined /> <Text>Points:</Text> {u.points || 0}</p>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default MerchantDashboard;