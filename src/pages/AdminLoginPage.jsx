import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminApi } from '@/services/api';
import { useAuth } from '@/services/Auth.jsx';

const AdminLoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await adminApi.login(data);

      if (response.data.success) {
        login(response.data.admin, response.data.token);
        toast.success('Logged in successfully');
        navigate('/admin/dashboard');
      } else {
        toast.error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message ||
      error.response?.status === 401 ? 'Invalid username or password' :
          'Failed to connect to the server';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="page-container">
        <div className="form-container admin-login">
          <h1>Admin Login</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                  id="username"
                  type="text"
                  {...register('username', { required: 'Username is required' })}
              />
              {errors.username && <span className="error">{errors.username.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                  id="password"
                  type="password"
                  {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <span className="error">{errors.password.message}</span>}
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <Link to="/" className="cancel-button">Back to Home</Link>
            </div>
          </form>
        </div>
      </div>
  );
};

export default AdminLoginPage;