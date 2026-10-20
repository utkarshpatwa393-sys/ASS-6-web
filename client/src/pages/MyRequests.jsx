// client/src/pages/MyRequests.jsx
// Displays all blood requests created by the user, with edit access for Pending requests

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const MyRequests = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await fetch('/api/requests/my', {
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="badge badge-pending">
            <Clock size={12} /> Pending Review
          </span>
        );
      case 'Approved':
        return (
          <span className="badge badge-approved">
            <CheckCircle2 size={12} /> Approved & Fulfilled
          </span>
        );
      case 'Rejected':
        return (
          <span className="badge badge-rejected">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">My Blood Requests</h1>
          <p className="page-subtitle">
            Track and manage your blood transfusion requests in real time
          </p>
        </div>
        <Link to="/requests/new" className="btn btn-primary">
          <Plus size={18} />
          <span>New Request</span>
        </Link>
      </div>

      {loading ? (
        <p>Loading your blood requests...</p>
      ) : requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No Blood Requests Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            You haven't requested any blood units yet. If a patient is in need, submit a request.
          </p>
          <Link to="/requests/new" className="btn btn-primary">
            Create First Request
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Group</th>
                <th>Units</th>
                <th>Hospital</th>
                <th>Required By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td>
                    <strong>{req.patientName}</strong>
                    {req.remarks && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{req.remarks}</div>
                    )}
                    {req.rejectionReason && (
                      <div style={{ fontSize: '0.78rem', color: '#b91c1c', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <AlertTriangle size={12} /> Reason: {req.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-blood">{req.bloodGroup}</span>
                  </td>
                  <td>{req.units} Unit(s)</td>
                  <td style={{ color: '#475569' }}>{req.hospital}</td>
                  <td>{new Date(req.requiredByDate).toLocaleDateString()}</td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td>
                    {req.status === 'Pending' ? (
                      <Link
                        to={`/my-requests/${req._id}/edit`}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </Link>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Locked ({req.status})
                      </span>
                    )}
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

export default MyRequests;
