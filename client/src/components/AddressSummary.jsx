import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { zokomId } from './utils/auth';
import './verifStyles.css';

const AddressSummary = ({ onEdit }) => {
  const [billingInfo, setBillingInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchBillingInfo = async () => {
      try {
        const userId = zokomId();
        if (!userId) {
          if (isMounted) {
            setError('User ID not found');
            setLoading(false);
          }
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/billing/${userId}`);
        if (isMounted) {
          setBillingInfo(response.data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching billing info:', error);
        if (isMounted) {
          setError('Error fetching address information');
          setLoading(false);
        }
      }
    };

    fetchBillingInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="sc-4f945396-2 fuTCuI">
      <div>
        <h2 className="encore-text encore-text-title-small" style={{ paddingBlockEnd: 'var(--encore-spacing-tighter-4)' }}>Address</h2>
        <p className="encore-text encore-text-body-small encore-internal-color-text-subdued" style={{ paddingBlockEnd: 'var(--encore-spacing-base)' }}>Tax is calculated based on your address.</p>
      </div>
      <div className="sc-9675d5fd-0 hkTvfI">
        <div className="sc-eMkmGk bwjjQX encore-layout-themes">
          <div className="sc-cZpZpK fcVZzQ">
            <div>
              <p className="encore-text encore-text-body-small encore-internal-color-text-subdued" style={{ lineHeight: '1.5' }}>{billingInfo?.street}</p>
              <p className="encore-text encore-text-body-small" style={{ lineHeight: '1.5' }}>{`${billingInfo?.city}, ${billingInfo?.state} ${billingInfo?.postalCode}`}</p>
              <p className="encore-text encore-text-body-small" style={{ lineHeight: '1.5' }}>CA</p>
            </div>
            <button 
              className="Button-sc-1dqy6lx-0 cixQJq encore-text-body-medium-bold sc-jSUdEz hHIkuQ" 
              onClick={() => onEdit(billingInfo)}
            >
              Edit
            </button>
          </div>
          <div>
            <div className="Container-sc-eij2zk-0 dLJxQP encore-base-set">
              <span className="encore-text encore-text-body-small encore-internal-color-text-base">
                Your address has been saved.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressSummary;