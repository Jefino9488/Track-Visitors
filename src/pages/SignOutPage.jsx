import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { visitorApi } from '@/services/api';

const SignOutPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [visitorData, setVisitorData] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await visitorApi.signOut(data.visitorNumber);
      setVisitorData(response.data.data);
      setSuccess(true);

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error(error.response?.data?.message || 'Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h1>Visitor Sign Out</h1>
        
        {!success ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="visitorNumber">Visitor Number *</label>
              <input
                id="visitorNumber"
                type="text"
                placeholder="Enter your 4-digit visitor number"
                {...register('visitorNumber', { 
                  required: 'Visitor number is required',
                  pattern: {
                    value: /^\d{4}$/,
                    message: 'Please enter a valid 4-digit visitor number'
                  }
                })}
              />
              {errors.visitorNumber && <span className="error">{errors.visitorNumber.message}</span>}
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Signing Out...' : 'Sign Out'}
              </button>
              <Link to="/" className="cancel-button">Cancel</Link>
            </div>
          </form>
        ) : (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h2>Sign-Out Successful!</h2>
            
            {visitorData && (
              <div className="visitor-details">
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{visitorData.full_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Apartment:</span>
                    <span className="detail-value">{visitorData.apartment_number}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">In Time:</span>
                    <span className="detail-value">{formatDateTime(visitorData.in_time)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Out Time:</span>
                    <span className="detail-value">{formatDateTime(visitorData.actual_out_time)}</span>
                  </div>
                </div>
              </div>
            )}
            
            <p>Thank you for your visit!</p>
            <p>Redirecting to home page...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignOutPage;