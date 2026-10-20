// client/src/pages/NewRequest.jsx
// Form to create a new blood request for a patient in need

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FilePlus, AlertCircle, ArrowLeft } from 'lucide-react';

const NewRequest = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: user?.bloodGroup || 'A+',
    units: 1,
    hospital: '',
    requiredByDate: '',
    remarks: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit blood request');
      }

      // If user is admin, take to admin requests; else my-requests
      if (user?.role === 'admin') {
        navigate('/admin/requests');
      } else {
        navigate('/my-requests');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/my-requests" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} />
          <span>Back to My Requests</span>
        </Link>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Create Blood Request</h1>
          <p className="page-subtitle">
            Submit a verified request for a patient requiring urgent blood transfusion
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Patient Full Name</label>
            <input
              type="text"
              name="patientName"
              required
              className="form-control"
              placeholder="e.g. Ramesh Chandra"
              value={formData.patientName}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Required Blood Group</label>
              <select
                name="bloodGroup"
                required
                className="form-control"
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Units Needed</label>
              <input
                type="number"
                name="units"
                min="1"
                max="20"
                required
                className="form-control"
                value={formData.units}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Hospital / Clinic Name & Location</label>
              <input
                type="text"
                name="hospital"
                required
                className="form-control"
                placeholder="e.g. City General Hospital, Mumbai"
                value={formData.hospital}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Required By Date</label>
              <input
                type="date"
                name="requiredByDate"
                required
                className="form-control"
                value={formData.requiredByDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Clinical Notes (Optional)</label>
            <textarea
              name="remarks"
              rows="3"
              className="form-control"
              placeholder="e.g. Scheduled for emergency surgery"
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
          >
            <FilePlus size={18} />
            <span>{loading ? 'Submitting Request...' : 'Submit Blood Request'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewRequest;
