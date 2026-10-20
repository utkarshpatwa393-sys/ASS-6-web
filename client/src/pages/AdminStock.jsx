// client/src/pages/AdminStock.jsx
// Blood Stock View for all 8 groups with threshold controls and Stretch Goal Compatibility Advisor

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CompatibilityModal from '../components/CompatibilityModal';
import { Droplet, AlertTriangle, ShieldCheck, Edit2, Check, X } from 'lucide-react';

const AdminStock = () => {
  const { token } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editUnits, setEditUnits] = useState(0);
  const [editThreshold, setEditThreshold] = useState(5);
  const [saveMsg, setSaveMsg] = useState('');

  // Compatibility Advisor state (Stretch Goal)
  const [advisorGroup, setAdvisorGroup] = useState(null);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await fetch('/api/stock');
      const data = await res.json();
      if (res.ok) {
        setStocks(data);
      }
    } catch (err) {
      console.error('Error fetching stock:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingGroup(item.bloodGroup);
    setEditUnits(item.units);
    setEditThreshold(item.minThreshold || 5);
  };

  const cancelEdit = () => {
    setEditingGroup(null);
  };

  const handleSaveStock = async (bloodGroup) => {
    try {
      const res = await fetch(`/api/stock/${encodeURIComponent(bloodGroup)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          units: Number(editUnits),
          minThreshold: Number(editThreshold),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMsg(`Stock for ${bloodGroup} updated successfully`);
        setEditingGroup(null);
        fetchStock();
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  const openAdvisor = (bloodGroup) => {
    setAdvisorGroup(bloodGroup);
    setIsAdvisorOpen(true);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Blood Stock Management</h1>
        <p className="page-subtitle">
          Manage inventory across all 8 standard blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-)
        </p>
      </div>

      {saveMsg && (
        <div className="alert alert-success">
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Stretch Goal Banner */}
      <div className="alert alert-info" style={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <strong>🎯 Stretch Goal Feature: Blood Compatibility Matrix</strong>
          <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
            When a requested blood group has low or zero units in stock, check compatible donor alternatives.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['A+', 'B+', 'AB-', 'O-'].map((bg) => (
            <button
              key={bg}
              onClick={() => openAdvisor(bg)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              Test {bg} Compatibility
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p>Loading blood stock data...</p>
      ) : (
        <div className="stock-grid">
          {stocks.map((item) => {
            const isLow = item.units <= item.minThreshold;
            const isEditing = editingGroup === item.bloodGroup;

            return (
              <div key={item.bloodGroup} className={`stock-card ${isLow ? 'is-low' : ''}`}>
                <div>
                  <div className="stock-header">
                    <span className="stock-blood-group">{item.bloodGroup}</span>
                    <div>
                      {isLow ? (
                        <span className="badge badge-low">
                          <AlertTriangle size={12} /> Low Stock
                        </span>
                      ) : (
                        <span className="badge badge-approved">
                          <ShieldCheck size={12} /> Adequate
                        </span>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                      <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Units in Stock:</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={editUnits}
                          onChange={(e) => setEditUnits(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Min Threshold Alert:</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={editThreshold}
                          onChange={(e) => setEditThreshold(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="stock-units">{item.units}</div>
                      <div className="stock-label">Units Available</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Alert threshold: {item.minThreshold || 5} units
                      </div>
                    </>
                  )}
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.4rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSaveStock(item.bloodGroup)}
                        className="btn btn-success btn-sm"
                        style={{ flex: 1 }}
                      >
                        <Check size={14} /> Save
                      </button>
                      <button onClick={cancelEdit} className="btn btn-secondary btn-sm">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(item)}
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => openAdvisor(item.bloodGroup)}
                        className="btn btn-secondary btn-sm"
                        title="Check Compatible Groups"
                      >
                        Compatibility
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compatibility Advisor Modal */}
      <CompatibilityModal
        bloodGroup={advisorGroup}
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
      />
    </div>
  );
};

export default AdminStock;
