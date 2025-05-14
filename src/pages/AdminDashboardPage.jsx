import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const AdminDashboardPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchVisitors = async (page = 1, limit = 10, searchTerm = '') => {
    setLoading(true);
    try {
      const response = await adminApi.getVisitors(page, limit, searchTerm);
      setVisitors(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      toast.error('Failed to fetch visitor data');
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        logout();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors(pagination.page, pagination.limit, search);
  }, [pagination.page]); // Fetch when page changes

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 }); // Reset to first page
    fetchVisitors(1, pagination.limit, search);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <div className="search-container">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by name, visitor number, apartment, etc."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="visitors-table-container">
        {loading ? (
          <div className="loading">Loading visitor data...</div>
        ) : visitors.length === 0 ? (
          <div className="no-data">No visitors found</div>
        ) : (
          <>
            <table className="visitors-table">
              <thead>
                <tr>
                  <th>Visitor #</th>
                  <th>Name</th>
                  <th>Apartment</th>
                  <th>Vehicle</th>
                  <th>Purpose</th>
                  <th>In Time</th>
                  <th>Expected Out</th>
                  <th>Actual Out</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((visitor) => (
                  <tr key={visitor.id}>
                    <td>{visitor.visitor_number}</td>
                    <td>{visitor.full_name}</td>
                    <td>{visitor.apartment_number}</td>
                    <td>{visitor.vehicle_info || 'N/A'}</td>
                    <td>{visitor.purpose}</td>
                    <td>{formatDateTime(visitor.in_time)}</td>
                    <td>{formatDateTime(visitor.expected_out_time)}</td>
                    <td>{formatDateTime(visitor.actual_out_time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button 
                onClick={() => handlePageChange(1)} 
                disabled={pagination.page === 1}
              >
                First
              </button>
              <button 
                onClick={() => handlePageChange(pagination.page - 1)} 
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button 
                onClick={() => handlePageChange(pagination.page + 1)} 
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </button>
              <button 
                onClick={() => handlePageChange(pagination.totalPages)} 
                disabled={pagination.page === pagination.totalPages}
              >
                Last
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;