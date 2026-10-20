// client/src/pages/AdminNewDonation.jsx
// Form for Admin to record a blood donation (enforcing the strict eligibility business rule)

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, AlertCircle, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

const AdminNewDonation = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDonorId = searchParams.get('donorId') || '';

  const [donors, setDonors] = useState([]);
  const [selectedDonorId, setSelectedDonorId] = useState(preselectedDonorId);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [units, setUnits] = useState(1);
  const [donationDate, setDonationDate] = useState(new Date().toISOString().substring(0, 10));
  const [remarks, setRemarks] = useState('Routine blood drive donation');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchDonorsList();
  }, []);

  useEffect(() => {
    if (donors.length > 0) {
      if (preselectedDonorId) {
        const found = donors.find((d) => d._id === preselectedDonorId);
        if (found) {
          setSelectedDonorId(found._id);
          setSelectedDonor(found);
          return;
        }
      }
      // Default to first donor in list if none preselected
      setSelectedDonorId(donors[0]._id);
      setSelectedDonor(donors[0]);
    }
  }, [donors, preselectedDonorId]);

  const fetchDonorsList = async () => {
    try {
      const res = await fetch('/api/donors', {
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

  const handleDonorChange = (e) => {
    const id = e.target.value;
    setSelectedDonorId(id);
    const donorObj = donors.find((d) => d._id === id);
    setSelectedDonor(donorObj || null);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Business rule check: only eligible donors allowed
    if (!selectedDonor?.eligibility?.isEligible) {
      setError(`Cannot record donation: ${selectedDonor?.eligibility?.reason || 'Donor is ineligible'}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          donorId: selectedDonorId,
          units: Number(units),
          donationDate,
          remarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to record donation');
      }

      setSuccessMsg(data.message);
      // Refresh donor list to update last donation date and eligibility
      fetchDonorsList();

      setTimeout(() => {
        navigate('/admin/stock');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isEligible = selectedDonor?.eligibility?.isEligible;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/admin/donors" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} />
          <span>Back to Donors List</span>
        </Link>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Record Blood Donation</h1>
          <p className="page-subtitle">
            Log an official blood donation and automatically replenish blood bank inventory
          </p>
        </div>

        {successMsg && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <p>Loading donors...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Donor Selection Dropdown */}
            <div className="form-group">
              <label className="form-label">Select Donor</label>
              <select
                className="form-control"
                value={selectedDonorId}
                onChange={handleDonorChange}
                required
              >
                {donors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.bloodGroup}) — {d.city || 'No city'} {d.eligibility?.isEligible ? '✅ [Eligible]' : '❌ [Ineligible]'}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Donor Eligibility Feedback */}
            {selectedDonor && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  backgroundColor: isEligible ? '#f0fdf4' : '#fff7f7',
                  border: `1px solid ${isEligible ? '#bbf7d0' : '#fecaca'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isEligible ? <CheckCircle2 size={18} color="#15803d" /> : <XCircle size={18} color="#b91c1c" />}
                    <strong>Eligibility Verification:</strong>
                  </div>
                  <span className={`badge ${isEligible ? 'badge-eligible' : 'badge-ineligible'}`}>
                    {isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0 }}>
                  {selectedDonor.eligibility?.reason}
                </p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                  <span>Blood Group: <strong>{selectedDonor.bloodGroup}</strong></span>
                  <span>Age: <strong>{selectedDonor.eligibility?.age} yrs</strong></span>
                  <span>Last Donated: <strong>{selectedDonor.lastDonationDate ? new Date(selectedDonor.lastDonationDate).toLocaleDateString() : 'Never'}</strong></span>
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Units Donated</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  required
                  className="form-control"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Donation Date</label>
                <input
                  type="date"
                  required
                  className="form-control"
                  value={donationDate}
                  onChange={(e) => setDonationDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Event / Camp / Remarks</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Annual Blood Donation Camp 2026"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !isEligible}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            >
              <PlusCircle size={18} />
              <span>
                {submitting
                  ? 'Saving Record...'
                  : isEligible
                  ? `Confirm & Record Donation (+${units} Unit of ${selectedDonor?.bloodGroup})`
                  : 'Cannot Record (Donor Ineligible)'}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminNewDonation;
