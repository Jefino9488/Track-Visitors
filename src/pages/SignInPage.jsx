import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { visitorApi } from '@/services/api';

const SignInPage = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [visitorData, setVisitorData] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await visitorApi.signIn(data);
      setVisitorData(response.data.data);
      setShowModal(true);
      reset();

      setTimeout(() => {
        if (showModal) {
          setShowModal(false);
          navigate('/');
        }
      }, 30000);
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error(error.response?.data?.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    navigate('/');
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h1>Visitor Sign In</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              type="text"
              {...register('fullName', { required: 'Full name is required' })}
            />
            {errors.fullName && <span className="error">{errors.fullName.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="apartmentNumber">Apartment Number *</label>
            <input
              id="apartmentNumber"
              type="text"
              {...register('apartmentNumber', { required: 'Apartment number is required' })}
            />
            {errors.apartmentNumber && <span className="error">{errors.apartmentNumber.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="vehicleInfo">Vehicle Information (optional)</label>
            <input
              id="vehicleInfo"
              type="text"
              placeholder="Make, model, license plate"
              {...register('vehicleInfo')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose of Visit *</label>
            <input
              id="purpose"
              type="text"
              {...register('purpose', { required: 'Purpose is required' })}
            />
            {errors.purpose && <span className="error">{errors.purpose.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="visitDuration">Visit Duration *</label>
            <select
              id="visitDuration"
              {...register('visitDuration', { required: 'Visit duration is required' })}
            >
              <option value="">Select duration</option>
              <option value="30 minutes">30 minutes</option>
              <option value="1 hour">1 hour</option>
              <option value="2 hours">2 hours</option>
              <option value="3 hours">3 hours</option>
              <option value="4 hours">4 hours</option>
              <option value="1 day">1 day</option>
            </select>
            {errors.visitDuration && <span className="error">{errors.visitDuration.message}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <Link to="/" className="cancel-button">Cancel</Link>
          </div>
        </form>
      </div>

      {showModal && visitorData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Sign-In Successful!</h2>
            <div className="visitor-details">
              <p className="visitor-number">Your Visitor Number: <strong>{visitorData.visitor_number}</strong></p>
              <p><strong>Please remember this number for sign-out.</strong></p>
              
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
                  <span className="detail-label">Vehicle:</span>
                  <span className="detail-value">{visitorData.vehicle_info || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Purpose:</span>
                  <span className="detail-value">{visitorData.purpose}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{visitorData.visit_duration}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">In Time:</span>
                  <span className="detail-value">{formatDateTime(visitorData.in_time)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Expected Out Time:</span>
                  <span className="detail-value">{formatDateTime(visitorData.expected_out_time)}</span>
                </div>
              </div>
            </div>
            <button onClick={closeModal} className="modal-close-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignInPage;