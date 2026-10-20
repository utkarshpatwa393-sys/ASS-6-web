// client/src/pages/AdminDonorDetails.jsx
// Detailed donor profile view including eligibility breakdown and donation history

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  User,
  Heart,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  PlusCircle,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';

const AdminDonorDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDonorDetails();
  }, [id]);

  const fetchDonorDetails = async () => {
    try {
      const res = await fetch(`/api/donors/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to fetch donor details');
      }
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p style={{ textAlign: 'center', padding: '3rem' }}>Loading donor profile...</p>;
  }

  if (error || !data) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error || 'Donor not found'}</p>
        <Link to="/admin/donors" className="btn btn-secondary">
          Back to Donors List
        </Link>
      </div>
    );
  }

  const { donor, eligibility, donations } = data;
  const isEligible = eligibility?.isEligible;

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/admin/donors" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} />
          <span>Back to All Donors</span>
        </Link>
      </div>

      {/* Header with Quick Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">{donor.name}</h1>
          <p className="page-subtitle">
            Registered Blood Donor Profile & Health Record
          </p>
        </div>
        <div>
          <Link
            to={`/admin/donations/new?donorId=${donor._id}`}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <PlusCircle size={18} />
            <span>Record Donation for this Donor</span>
          </Link>
        </div>
      </div>

      {/* Live Eligibility Status Banner */}
      <div
        className="card"
        style={{
          borderLeft: `6px solid ${isEligible ? 'var(--success)' : 'var(--danger)'}`,
          marginBottom: '1.75rem',
          backgroundColor: isEligible ? '#f0fdf4' : '#fff7f7',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: isEligible ? '#dcfce7' : '#fee2e2',
              color: isEligible ? '#15803d' : '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isEligible ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>Eligibility Evaluation:</span>
              <span className={`badge ${isEligible ? 'badge-eligible' : 'badge-ineligible'}`}>
                {isEligible ? 'ELIGIBLE TO DONATE' : 'INELIGIBLE'}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              {eligibility?.reason}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#475569', marginTop: '0.6rem' }}>
              <div>
                <strong>Age:</strong> {eligibility?.age !== null ? `${eligibility.age} years` : 'N/A'} (Requirement: 18-65)
              </div>
              {eligibility?.daysSinceLastDonation !== null && eligibility?.daysSinceLastDonation !== undefined && (
                <div>
                  <strong>Days Since Last Donation:</strong> {eligibility.daysSinceLastDonation} days
                </div>
              )}
              {eligibility?.nextEligibleDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#1e293b' }}>
                  <Clock size={14} color="#0284c7" />
                  <strong>Next Eligible Date:</strong> {new Date(eligibility.nextEligibleDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Donor Information Card */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <h2 className="card-title">Contact & Personal Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Blood Group
            </span>
            <div style={{ marginTop: '0.25rem' }}>
              <span className="badge badge-blood">{donor.bloodGroup}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Email Address
            </span>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
              {donor.email}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Phone Number
            </span>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>
              {donor.phone || 'N/A'}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              City
            </span>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>
              {donor.city || 'N/A'}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Date of Birth
            </span>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>
              {donor.dateOfBirth ? new Date(donor.dateOfBirth).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Last Recorded Donation
            </span>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>
              {donor.lastDonationDate
                ? new Date(donor.lastDonationDate).toLocaleDateString()
                : 'Never donated before'}
            </p>
          </div>
        </div>
      </div>

      {/* Donation History Table */}
      <div className="card">
        <h2 className="card-title">Past Donations ({donations?.length || 0})</h2>
        {donations?.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No donations have been recorded for this donor yet.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d._id}>
                    <td>{new Date(d.donationDate).toLocaleDateString()}</td>
                    <td>
                      <span className="badge badge-blood">{d.bloodGroup}</span>
                    </td>
                    <td>{d.units} Unit(s)</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{d.remarks || 'Regular donation'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDonorDetails;
