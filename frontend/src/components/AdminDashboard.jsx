
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  Typography,
  Form,
  Input,
  Button,
  message,
  Spin,
  Row,
  Col,
  Table,
  Empty,
  Card,
  Select,
} from 'antd';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const { Title } = Typography;
const { Option } = Select;

function AdminDashboard() {
  const [stats, setStats] = useState({ users: [], merchants: [] });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(stats.users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'users_data.xlsx');
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setStats(res.data);
    } catch {
      message.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setAdding(true);
    try {
      await api.post('/admin/merchant', values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      message.success('Merchant added successfully');
      fetchStats();
    } catch {
      message.error('Failed to add merchant');
    } finally {
      setAdding(false);
    }
  };

  const merchantColumns = [
    {
      title: 'Tier Name',
      dataIndex: 'tierName',
      key: 'tierName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Tier ID',
      dataIndex: 'tierId',
      key: 'tierId',
    },
    {
      title: 'Registered Users',
      key: 'registeredUsers',
      render: (_, merchant) => {
        const count = stats.users.filter(user => user.tierId === merchant.tierId).length;
        return count;
      },
    },
  ];

  const userColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text || 'Unnamed User',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Tier ID',
      dataIndex: 'tierId',
      key: 'tierId',
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
    },
    {
      title: 'Phone Number',
      dataIndex: 'mobile',
      key: 'mobile',
    },
  ];

  const filteredUsers = selectedTierId
    ? stats.users.filter(user => user.tierId === selectedTierId)
    : stats.users;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded shadow">
      <Title level={2} className="text-center mb-6">Admin Dashboard</Title>

      {loading ? (
        <div className="text-center my-20">
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={10}>
            <Card title="Add New Merchant" className="mb-4">
              <Form layout="vertical" onFinish={onFinish}>
                <Form.Item
                  label="Name"
                  name="tierName"
                  rules={[{ required: true, message: 'Please enter merchant name' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true, message: 'Please enter email' }, { type: 'email' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: true, message: 'Please enter password' }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  label="Tier ID"
                  name="tierId"
                  rules={[{ required: true, message: 'Please enter tier ID' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Shareable QR"
                  name="qrCode"
                  rules={[{ required: true, message: 'Please mention shareable QR' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={adding} block>
                    Add Merchant
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            <Card title="Merchants">
              {stats.merchants.length === 0 ? (
                <Empty description="No merchants yet" />
              ) : (
                <Table
                  dataSource={stats.merchants}
                  columns={merchantColumns}
                  rowKey="_id"
                  pagination={false}
                  size="small"
                  onRow={(record) => ({
                    onClick: () => setSelectedTierId(record.tierId), // Set selectedTierId on row click
                  })}
                />
              )}
            </Card>
          </Col>

          <Col xs={24} md={14}>
            <Card title="All registered users">
              <Select
                placeholder="Select Tier ID"
                style={{ width: '100%', marginBottom: 16 }}
                onChange={value => setSelectedTierId(value)}
                allowClear
              >
                <Option value={null}>All Tiers</Option>
                {stats.merchants.map(merchant => (
                  <Option key={merchant.tierId} value={merchant.tierId}>
                    {merchant.tierName} ({merchant.tierId})
                  </Option>
                ))}
              </Select>
              <Button type="primary" onClick={exportToExcel} style={{ marginBottom: 16 }}>
                Download Users Data
              </Button>
              {filteredUsers.length === 0 ? (
                <Empty description="No users available" />
              ) : (
                <Table
                  dataSource={filteredUsers}
                  columns={userColumns}
                  rowKey="_id"
                  pagination={false}
                  size="small"
                />
              )}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default AdminDashboard;