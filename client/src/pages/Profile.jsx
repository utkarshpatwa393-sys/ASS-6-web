// client/src/pages/Profile.jsx
// Donor profile page with live eligibility status badge and next eligible date

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Calendar, MapPin, Phone, Heart, CheckCircle2, XCircle, Clock, Edit2 } from 'lucide-react';

const Profile = () => {
  const { user, eligibility, token, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.substring(0, 10) : '',
    bloodGroup: user?.bloodGroup || 'O+',
  });
  const [updateMsg, setUpdateMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUpdateMsg('');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setUpdateMsg('Profile updated successfully!');
        setIsEditing(false);
        refreshUser();
      } else {
        setUpdateMsg(data.message || 'Update failed');
      }
    } catch (err) {
      setUpdateMsg('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Donor Profile & Eligibility</h1>
        <p className="page-subtitle">
          View your blood donation eligibility status and personal donor credentials
        </p>
      </div>

      {updateMsg && (
        <div className={`alert ${updateMsg.includes('success') ? 'alert-success' : 'alert-danger'}`}>
          <span>{updateMsg}</span>
        </div>
      )}

      {/* Prominent Eligibility Status Box */}
      <div
        className="card"
        style={{
          borderLeft: `6px solid ${eligibility?.isEligible ? 'var(--success)' : 'var(--danger)'}`,
          marginBottom: '2rem',
          backgroundColor: eligibility?.isEligible ? '#f0fdf4' : '#fff7f7',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: eligibility?.isEligible ? '#dcfce7' : '#fee2e2',
                color: eligibility?.isEligible ? '#15803d' : '#b91c1c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {eligibility?.isEligible ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Eligibility Status:
                </span>
                <span className={`badge ${eligibility?.isEligible ? 'badge-eligible' : 'badge-ineligible'}`}>
                  {eligibility?.isEligible ? 'ELIGIBLE TO DONATE' : 'CURRENTLY NOT ELIGIBLE'}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                {eligibility?.reason}
              </p>

              {/* Extra details: Age and Cooldown */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#475569', marginTop: '0.75rem' }}>
                <div>
                  <strong>Calculated Age:</strong> {eligibility?.age != null ? `${eligibility.age} years (Limit: 18-65)` : 'N/A'}
                </div>
                {eligibility?.daysSinceLastDonation != null && (
                  <div>
                    <strong>Days Since Last Donation:</strong> {eligibility.daysSinceLastDonation} days
                  </div>
                )}
                {eligibility?.nextEligibleDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#1e293b' }}>
                    <Clock size={15} color="#0284c7" />
                    <strong>Next Eligible Date:</strong>{' '}
                    {new Date(eligibility.nextEligibleDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/requests/new" className="btn btn-secondary btn-sm">
              Request Blood
            </Link>
            <Link to="/my-donations" className="btn btn-primary btn-sm">
              View My Donations
            </Link>
          </div>
        </div>
      </div>

      {/* Donor Information Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="card-title" style={{ margin: 0 }}>Donor Details</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-secondary btn-sm"
          >
            <Edit2 size={15} />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select
                  className="form-control"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  required
                  className="form-control"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Full Name
              </span>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>{user?.name}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Blood Group
              </span>
              <p style={{ marginTop: '0.2rem' }}>
                <span className="badge badge-blood">{user?.bloodGroup || 'Not specified'}</span>
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Email Address
              </span>
              <p style={{ fontSize: '1rem', marginTop: '0.2rem', color: 'var(--text-secondary)' }}>{user?.email}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Date of Birth
              </span>
              <p style={{ fontSize: '1rem', marginTop: '0.2rem' }}>
                {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                City
              </span>
              <p style={{ fontSize: '1rem', marginTop: '0.2rem' }}>{user?.city || 'Not specified'}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Contact Phone
              </span>
              <p style={{ fontSize: '1rem', marginTop: '0.2rem' }}>{user?.phone || 'Not specified'}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Last Donation Date
              </span>
              <p style={{ fontSize: '1rem', marginTop: '0.2rem', fontWeight: 600 }}>
                {user?.lastDonationDate
                  ? new Date(user.lastDonationDate).toLocaleDateString()
                  : 'No past donations recorded'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
