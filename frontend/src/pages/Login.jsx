import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Login({ setUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    if (localUser) {
      console.log(localUser);
      navigate(localUser.isAdmin ? '/admin' : '/merchant');
    }
  }, [localUser, navigate]);

  const onFinish = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await api.post('/login', { email, password });
      const user = res.data.user || JSON.parse(atob(res.data.token.split('.')[1]));
      console.log(user);
      localStorage.setItem('token', res.data.token);
      setUser(user);
      setLocalUser(user);
      message.success('Login successful');
    } catch (err) {
      message.error('Login failed: Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center mb-6">
          {/* Optional logo */}
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-sm text-gray-500">Please sign in to your account</p>
        </div>

        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ email: '', password: '' }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="you@example.com" size="large" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password placeholder="••••••••" size="large" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              disabled={loading}
              className="mt-2"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4 text-sm text-gray-500">
          Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Sign up</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
