// client/src/pages/MyDonations.jsx
// Displays personal donation history for the logged-in donor

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, Calendar, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyDonations = () => {
  const { token, user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await fetch('/api/donors/my/donations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setDonations(data);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalUnitsDonated = donations.reduce((acc, curr) => acc + (curr.units || 1), 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Donation History</h1>
        <p className="page-subtitle">
          Track every life-saving blood donation you have made with LifeFlow
        </p>
      </div>

      {/* Summary Banner */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon red">
            <Heart size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Donations</div>
            <div className="stat-value">{donations.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Units Donated</div>
            <div className="stat-value">{totalUnitsDonated} Unit(s)</div>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Loading your donation history...</p>
      ) : donations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Heart size={44} color="#dc2626" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No Donations Recorded Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            When an admin logs your blood donation at a blood drive or hospital, it will appear here.
          </p>
          <Link to="/profile" className="btn btn-secondary">
            Check Your Eligibility
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Donation Date</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Remarks / Event</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                      <Calendar size={15} color="#64748b" />
                      <span>{new Date(d.donationDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-blood">{d.bloodGroup}</span>
                  </td>
                  <td>
                    <strong>{d.units} Unit(s)</strong>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {d.remarks || 'Regular donation'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyDonations;
