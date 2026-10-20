// client/src/components/CompatibilityModal.jsx
// Stretch Goal Feature: Displays compatible donor blood groups & available stock

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, X } from 'lucide-react';

const CompatibilityModal = ({ bloodGroup, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && bloodGroup) {
      fetchCompatibility();
    }
  }, [isOpen, bloodGroup]);

  const fetchCompatibility = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stock/compatibility/${encodeURIComponent(bloodGroup)}`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching compatibility:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="modal-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert color="#dc2626" />
            <span>Blood Compatibility Advisor</span>
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.25rem' }}>
          Requested Recipient Blood Group: <strong style={{ color: '#dc2626', fontSize: '1.1rem' }}>{bloodGroup}</strong>
        </p>

        {loading ? (
          <p>Analyzing compatible donor groups...</p>
        ) : (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>
              Compatible Donor Blood Groups & Live Stock:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data?.compatibleGroups?.map((item) => (
                <div
                  key={item.bloodGroup}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: item.units > 0 ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${item.units > 0 ? '#bbf7d0' : '#fecaca'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-blood">{item.bloodGroup}</span>
                    {item.isUniversal && (
                      <span style={{ fontSize: '0.75rem', background: '#0284c7', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        Universal Donor
                      </span>
                    )}
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, color: item.units > 0 ? '#15803d' : '#b91c1c' }}>
                      {item.units} unit(s) available
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.25rem', fontSize: '0.82rem', color: '#64748b', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}>
              💡 <strong>Medical Rule:</strong> Group O- can be safely given to any patient in emergency transfusions.
            </div>

            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
              <button onClick={onClose} className="btn btn-secondary btn-sm">
                Close Advisor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompatibilityModal;
