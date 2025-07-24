import React, { useState } from 'react';
import { Form, Input, Checkbox, Button, message } from 'antd';
import api from '../api/axios';

function Register() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post('/register', values);
      message.success('Registered successfully');
      console.log('Success response:', res.data);
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message || err);
      message.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Register Merchant</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Name"
          name="tierName"
          rules={[{ required: true, message: 'Please enter your name' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Invalid email format' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Tier ID"
          name="tierId"
          rules={[{ required: true, message: 'Please enter your Tier ID' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Register;
