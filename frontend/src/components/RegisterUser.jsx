import React, { useState } from 'react';
import { Form, Input, Checkbox, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post('/register-user', values);
      const { user } = res.data;

      const isAdminMessage = user.isAdmin
        ? 'User is an admin.'
        : 'User is not an admin.';
      navigate('/login'); // Redirect to login page after alert
      // Show Ant Design toast
      toast.success(`Registered successfully. ${isAdminMessage}`, 3);

      // Wait for the message to display, then navigate
      // setTimeout(() => {
      //   navigate('/login');
      // }, 1500);
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message || err);
      message.error(err.response?.data?.message || 'Registration failed', 3);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Register</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Name"
          name="name"
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
        <Form.Item name="isAdmin" valuePropName="checked">
          <Checkbox>I'm an admin</Checkbox>
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
