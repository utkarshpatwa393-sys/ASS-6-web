// client/src/pages/AdminRequests.jsx
// Admin Blood Request fulfillment workflow with live stock deduction & rejection handling

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CompatibilityModal from '../components/CompatibilityModal';
import { Check, X, Clock, AlertCircle, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

const AdminRequests = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Reject modal state
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Compatibility advisor modal state
  const [advisorGroup, setAdvisorGroup] = useState(null);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    try {
      let url = '/api/requests';
      if (filterStatus) {
        url += `?status=${filterStatus}`;
      }
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(data);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Approve and Fulfill Request
  const handleApprove = async (id, bloodGroup, units) => {
    setMessage('');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/requests/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'Approved' }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        fetchRequests();
        setTimeout(() => setMessage(''), 4000);
      } else {
        // Business rule rejection: Insufficient stock
        setErrorMsg(data.message);
        if (data.compatibleAlternatives && data.compatibleAlternatives.length > 0) {
          setAdvisorGroup(bloodGroup);
          setIsAdvisorOpen(true);
        }
      }
    } catch (err) {
      setErrorMsg('Error processing request approval');
    }
  };

  // Open Reject Modal
  const openRejectModal = (id) => {
    setRejectingId(id);
    setRejectReason('Insufficient stock or administrative discrepancy.');
  };

  // Submit Rejection
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/requests/${rejectingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'Rejected',
          rejectionReason: rejectReason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Request was marked as Rejected');
        setRejectingId(null);
        fetchRequests();
        setTimeout(() => setMessage(''), 4000);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Error rejecting request');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Blood Request Management</h1>
        <p className="page-subtitle">
          Review, approve, fulfill, or reject blood requests with automated inventory checks
        </p>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterStatus('')}
          className={`btn btn-sm ${filterStatus === '' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Requests
        </button>
        <button
          onClick={() => setFilterStatus('Pending')}
          className={`btn btn-sm ${filterStatus === 'Pending' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Pending Review
        </button>
        <button
          onClick={() => setFilterStatus('Approved')}
          className={`btn btn-sm ${filterStatus === 'Approved' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Approved & Fulfilled
        </button>
        <button
          onClick={() => setFilterStatus('Rejected')}
          className={`btn btn-sm ${filterStatus === 'Rejected' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Rejected
        </button>
      </div>

      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No Requests Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            There are currently no blood requests matching your filter.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Patient & Requester</th>
                <th>Group</th>
                <th>Units</th>
                <th>Hospital</th>
                <th>Required By</th>
                <th>Status</th>
                <th>Fulfillment Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td>
                    <strong>{req.patientName}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Requester: {req.requester?.name || 'User'} ({req.requester?.phone || req.requester?.email || 'N/A'})
                    </div>
                    {req.remarks && (
                      <div style={{ fontSize: '0.78rem', color: '#0284c7', marginTop: '0.2rem' }}>
                        Notes: {req.remarks}
                      </div>
                    )}
                    {req.rejectionReason && (
                      <div style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '0.2rem' }}>
                        Rejection Reason: {req.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-blood">{req.bloodGroup}</span>
                  </td>
                  <td>
                    <strong>{req.units} Unit(s)</strong>
                  </td>
                  <td style={{ color: '#475569' }}>{req.hospital}</td>
                  <td>{new Date(req.requiredByDate).toLocaleDateString()}</td>
                  <td>
                    {req.status === 'Pending' && (
                      <span className="badge badge-pending">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                    {req.status === 'Approved' && (
                      <span className="badge badge-approved">
                        <CheckCircle2 size={12} /> Approved
                      </span>
                    )}
                    {req.status === 'Rejected' && (
                      <span className="badge badge-rejected">
                        <XCircle size={12} /> Rejected
                      </span>
                    )}
                  </td>
                  <td>
                    {req.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleApprove(req._id, req.bloodGroup, req.units)}
                          className="btn btn-success btn-sm"
                          title="Fulfill and Deduct Stock"
                        >
                          <Check size={14} /> Fulfill
                        </button>
                        <button
                          onClick={() => openRejectModal(req._id)}
                          className="btn btn-danger btn-sm"
                          title="Reject Request"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Reject Blood Request</h3>
            <form onSubmit={handleRejectSubmit}>
              <div className="form-group">
                <label className="form-label">Specify Rejection Reason:</label>
                <textarea
                  rows="3"
                  required
                  className="form-control"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger btn-sm">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Compatibility Advisor Modal (Stretch Goal) */}
      <CompatibilityModal
        bloodGroup={advisorGroup}
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
      />
    </div>
  );
};

export default AdminRequests;
