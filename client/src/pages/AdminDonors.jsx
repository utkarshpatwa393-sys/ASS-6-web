// client/src/pages/AdminDonors.jsx
// Admin page to search and filter eligible blood donors by blood group and city

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, UserCheck, Eye, PlusCircle, CheckCircle, XCircle } from 'lucide-react';

const AdminDonors = () => {
  const { token } = useAuth();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [bloodGroup, setBloodGroup] = useState('');
  const [city, setCity] = useState('');
  const [eligibleOnly, setEligibleOnly] = useState(false);

  useEffect(() => {
    fetchDonors();
  }, [bloodGroup, eligibleOnly]);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (bloodGroup) params.append('bloodGroup', bloodGroup);
      if (city) params.append('city', city);
      if (eligibleOnly) params.append('eligibleOnly', 'true');

      const res = await fetch(`/api/donors?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setDonors(data);
      }
    } catch (err) {
      console.error('Error fetching donors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySearch = (e) => {
    e.preventDefault();
    fetchDonors();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Donor Registry & Eligibility Search</h1>
          <p className="page-subtitle">
            Search active donors by blood group and location to organize drives or emergency donations
          </p>
        </div>
        <Link to="/admin/donations/new" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Record New Donation</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <form onSubmit={handleCitySearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>Filter Blood Group</label>
            <select
              className="form-control"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            >
              <option value="">All Blood Groups</option>
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

          <div style={{ flex: '2 1 240px' }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>Search by City</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="e.g. Mumbai, Pune, Delhi"
                className="form-control"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary">
                <Search size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', height: '42px', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={eligibleOnly}
                onChange={(e) => setEligibleOnly(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>Show Eligible Donors Only</span>
            </label>
          </div>
        </form>
      </div>

      {loading ? (
        <p>Searching donors...</p>
      ) : donors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No Donors Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            No donors matched your search criteria. Try removing or adjusting filters.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Group</th>
                <th>Age</th>
                <th>City</th>
                <th>Phone</th>
                <th>Last Donation</th>
                <th>Eligibility Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((donor) => {
                const isEligible = donor.eligibility?.isEligible;
                return (
                  <tr key={donor._id}>
                    <td>
                      <strong>{donor.name}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{donor.email}</div>
                    </td>
                    <td>
                      <span className="badge badge-blood">{donor.bloodGroup}</span>
                    </td>
                    <td>{donor.eligibility?.age !== null ? `${donor.eligibility.age} yrs` : 'N/A'}</td>
                    <td>{donor.city || 'N/A'}</td>
                    <td>{donor.phone || 'N/A'}</td>
                    <td>
                      {donor.lastDonationDate
                        ? new Date(donor.lastDonationDate).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td>
                      {isEligible ? (
                        <span className="badge badge-eligible">
                          <CheckCircle size={12} /> Eligible
                        </span>
                      ) : (
                        <span className="badge badge-ineligible" title={donor.eligibility?.reason}>
                          <XCircle size={12} /> Ineligible
                        </span>
                      )}
                    </td>
                    <td>
                      <Link
                        to={`/admin/donors/${donor._id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDonors;
