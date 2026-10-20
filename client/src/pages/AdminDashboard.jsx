// client/src/pages/AdminDashboard.jsx
// Main Admin Dashboard displaying group-wise stock, low-stock warnings, monthly donations, and pending requests

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Droplet,
  Heart,
  Clock,
  Users,
  AlertTriangle,
  Settings,
  PlusCircle,
  FileText,
  Activity,
  CheckCircle,
} from 'lucide-react';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gapDays, setGapDays] = useState(90);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data);
        setGapDays(data.donationGapDays);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGap = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg('');

    try {
      const res = await fetch('/api/dashboard/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ donationGapDays: gapDays }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMsg('Donation eligibility gap updated successfully!');
        fetchStats();
      } else {
        setSettingsMsg(data.message || 'Failed to update gap');
      }
    } catch (err) {
      setSettingsMsg('Error saving configuration');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return <p style={{ textAlign: 'center', padding: '3rem' }}>Loading Admin Dashboard...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Operations Dashboard</h1>
        <p className="page-subtitle">
          Real-time blood stock inventory, donor eligibility rules, and request fulfillments
        </p>
      </div>

      {/* 4 Core Stat Metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon red">
            <Droplet size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Blood Units</div>
            <div className="stat-value">{stats?.totalUnits || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Heart size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Donations This Month</div>
            <div className="stat-value">{stats?.donationsThisMonth || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Pending Requests</div>
            <div className="stat-value">{stats?.pendingRequestsCount || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Registered Donors</div>
            <div className="stat-value">{stats?.totalDonors || 0}</div>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Alert if any group <= minThreshold */}
      {stats?.lowStockGroups?.length > 0 && (
        <div className="alert alert-danger" style={{ alignItems: 'center' }}>
          <AlertTriangle size={22} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong>Low Blood Stock Alert!</strong> The following blood group(s) are critically low (at or below threshold):{' '}
            {stats.lowStockGroups.map((g) => (
              <span key={g.bloodGroup} className="badge badge-low" style={{ margin: '0 0.25rem' }}>
                {g.bloodGroup}: {g.units} units
              </span>
            ))}
          </div>
          <Link to="/admin/stock" className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap' }}>
            Manage Inventory
          </Link>
        </div>
      )}

      {/* Group-wise Stock Overview */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>Group-Wise Blood Stock (8 Groups)</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Live inventory across all ABO and Rh blood groups
            </p>
          </div>
          <Link to="/admin/stock" className="btn btn-secondary btn-sm">
            View All Stock Details
          </Link>
        </div>

        <div className="stock-grid">
          {stats?.stocks?.map((item) => {
            const isLow = item.units <= item.minThreshold;
            return (
              <div key={item.bloodGroup} className={`stock-card ${isLow ? 'is-low' : ''}`}>
                <div className="stock-header">
                  <span className="stock-blood-group">{item.bloodGroup}</span>
                  {isLow ? (
                    <span className="badge badge-low">Low Stock</span>
                  ) : (
                    <span className="badge badge-approved">Normal</span>
                  )}
                </div>
                <div className="stock-units">{item.units}</div>
                <div className="stock-label">
                  Units Available (Min: {item.minThreshold})
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Configurable Business Rule & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Configurable Business Rule Widget */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Settings size={20} color="var(--primary)" />
            <h2 className="card-title" style={{ margin: 0 }}>Business Rule Configuration</h2>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Configure the required cooldown gap (in days) between consecutive donations. Donors who donated more recently will be marked ineligible.
          </p>

          {settingsMsg && (
            <div className={`alert ${settingsMsg.includes('success') ? 'alert-success' : 'alert-danger'}`} style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}>
              <span>{settingsMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateGap}>
            <div className="form-group">
              <label className="form-label">Donation Cooldown Period (Days)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  min="30"
                  max="365"
                  required
                  className="form-control"
                  value={gapDays}
                  onChange={(e) => setGapDays(e.target.value)}
                />
                <button type="submit" disabled={savingSettings} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  {savingSettings ? 'Saving...' : 'Update Rule'}
                </button>
              </div>
              <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.3rem', display: 'block' }}>
                Default: 90 days. Age rule: 18-65 years (Fixed).
              </small>
            </div>
          </form>
        </div>

        {/* Quick Operations Actions */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>Admin Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to="/admin/donations/new"
              className="btn btn-primary"
              style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
            >
              <PlusCircle size={18} />
              <span>Record New Blood Donation (Eligibility Checked)</span>
            </Link>

            <Link
              to="/admin/requests"
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
            >
              <FileText size={18} />
              <span>Review & Fulfill Pending Requests ({stats?.pendingRequestsCount || 0})</span>
            </Link>

            <Link
              to="/admin/donors"
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
            >
              <Users size={18} />
              <span>Search Eligible Donors by Blood Group & City</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
