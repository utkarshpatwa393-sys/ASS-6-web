// client/src/pages/EditRequest.jsx
// Form to edit an existing blood request while it is still in 'Pending' status

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Edit3, AlertCircle, ArrowLeft, Lock } from 'lucide-react';

const EditRequest = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'A+',
    units: 1,
    hospital: '',
    requiredByDate: '',
    remarks: '',
  });

  const [status, setStatus] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await fetch(`/api/requests/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch request');
      }

      setStatus(data.status);
      setFormData({
        patientName: data.patientName,
        bloodGroup: data.bloodGroup,
        units: data.units,
        hospital: data.hospital,
        requiredByDate: data.requiredByDate ? data.requiredByDate.substring(0, 10) : '',
        remarks: data.remarks || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update request');
      }

      if (user?.role === 'admin') {
        navigate('/admin/requests');
      } else {
        navigate('/my-requests');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading request details...</p>;
  }

  // Business rule check: only Pending requests can be edited
  if (status !== 'Pending') {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <Lock size={40} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
          <h2>Request is Locked ({status})</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            According to the blood bank workflow, requests can only be modified while they are in <strong>Pending</strong> review.
            This request has already been marked as <strong>{status}</strong>.
          </p>
          <Link to="/my-requests" className="btn btn-secondary">
            Return to My Requests
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Edit Blood Request</h1>
          <p className="page-subtitle">
            Update details of your pending blood transfusion request
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
              <label className="form-label">Hospital Name & Location</label>
              <input
                type="text"
                name="hospital"
                required
                className="form-control"
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
            <label className="form-label">Reason / Clinical Notes</label>
            <textarea
              name="remarks"
              rows="3"
              className="form-control"
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.75rem' }}
            >
              <Edit3 size={18} />
              <span>{saving ? 'Saving Changes...' : 'Save & Update Request'}</span>
            </button>
            <Link to="/my-requests" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRequest;
