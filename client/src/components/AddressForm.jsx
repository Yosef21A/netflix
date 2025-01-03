import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddressForm.css';
import './ErrorAddressForm.css';
import AddressSummary from './AddressSummary';
import { zokomId } from './utils/auth'; // Ensure the correct import path

const AddressForm = ({ onSave, initialData }) => {
  const [street, setStreet] = useState(initialData?.street || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [state, setState] = useState(initialData?.state || '');
  const [postalCode, setPostalCode] = useState(initialData?.postalCode || '');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [errors, setErrors] = useState({
    street: false,
    city: false,
    state: false,
    postalCode: false
  });
  const [errorMessages, setErrorMessages] = useState({
    street: 'Enter a valid address',
    city: 'Enter a valid town/city',
    state: 'Enter a valid state',
    postalCode: 'Enter a valid ZIP Code'
  });
  const [isAddressSaved, setIsAddressSaved] = useState(false);
  
  useEffect(() => {
    const userIdFromToken = zokomId();
    if (userIdFromToken) {
      setUserId(userIdFromToken);
    } else {
      console.error('User ID not found in token');
    }
  }, []);

  const validateForm = () => {
    const newErrors = {
      street: !street || street.length < 5,
      city: !city || city.length < 2,
      state: !state || state.length < 2,
      postalCode: !postalCode || !/^\d{5}(-\d{4})?$/.test(postalCode)
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'street':
        return !value || value.length < 5;
      case 'city':
        return !value || value.length < 2;
      case 'state':
        return !value || value.length < 2;
      case 'postalCode':
        return !value || !/^\d{5}(-\d{4})?$/.test(value);
      default:
        return false;
    }
  };

  const handleBlur = (field, value) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: validateField(field, value),
    }));
  };

  const handleChange = (field, value) => {
    switch (field) {
      case 'street':
        setStreet(value);
        break;
      case 'city':
        setCity(value);
        break;
      case 'state':
        setState(value);
        break;
      case 'postalCode':
        setPostalCode(value);
        break;
      default:
        break;
    }
  };

  const getErrorMessage = (field) => {
    return errors[field] ? errorMessages[field] : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      console.log('Submitting billing info:', {
        userId,
        street,
        city,
        state,
        postalCode
      });

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/billing`, {
        userId,
        street,
        city,
        state,
        postalCode,
      });

      console.log('Server response:', response.data);
      setMessage(response.data.message);
      
      if (response.status === 201) {
        setIsAddressSaved(true); // Set the state to true to trigger the transition
        if (onSave && typeof onSave === 'function') {
          onSave(); // Notify the parent component
        }
      }
    } catch (error) {
      console.error('Error submitting billing info:', error.response?.data || error.message);
      setMessage(error.response?.data?.error || 'Error saving billing information');
    }
  };

  const renderError = (field) => {
    if (!errors[field]) return null;
    return (
      <div className="Help-sc-1xezfve-0 hrDyJz">
        <svg 
          data-encore-id="icon" 
          role="img" 
          aria-label="Error:" 
          aria-hidden="true" 
          className="Svg-sc-ytk21e-0 layuQh IconExclamationCircleForText-sc-1lnefk5-0 kcCtTj" 
          viewBox="0 0 16 16"
        >
          <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"></path>
          <path d="M7.25 9V4h1.5v5h-1.5zm0 3.026v-1.5h1.5v1.5h-1.5z"></path>
        </svg>
        <span className="Text-sc-g5kv67-0 kIgZst">{getErrorMessage(field)}</span>
      </div>
    );
  };

  if (isAddressSaved) {
    return <AddressSummary />;
  }

  return (
    <div className="sc-4f945396-2 fuTCuI">
      <div>
        <h2 className="encore-text encore-text-title-small" style={{ paddingBlockEnd: 'var(--encore-spacing-tighter-4)' }}>Address</h2>
        <p className="encore-text encore-text-body-small encore-internal-color-text-subdued" style={{ paddingBlockEnd: 'var(--encore-spacing-base)' }}>Tax is calculated based on your address.</p>
      </div>
      <div className="sc-9675d5fd-0 hkTvfI">
        <div className="sc-eMkmGk bwjjQX encore-layout-themes">
          <form className="sc-drMgrp eJsATt" onSubmit={handleSubmit}>
            <div className="Group-sc-u9bcx5-0 cihblq sc-kGLCbq fncBfD">
              <div className="LabelGroup-sc-1ibddrg-0 greqvR encore-text-body-small-bold">
                <label style={{paddingBottom: "0px"}} htmlFor="address-street" className="Label-sc-1c0cv3r-0 eYIJuv">
                  <span className="LabelInner-sc-19pye2k-0 fuQHra">Street</span>
                </label>
              </div>
              <input
                aria-invalid={errors.street}
                className={`Input-sc-1gbx9xe-0 ${errors.street ? 'KzfBT' : 'jfEurh'} encore-text-body-medium`}
                id="address-street"
                type="text"
                name="street"
                value={street}
                onChange={(e) => handleChange('street', e.target.value)}
                onBlur={(e) => handleBlur('street', e.target.value)}
              />
              {renderError('street')}
            </div>
            <div className="Group-sc-u9bcx5-0 cihblq sc-kGLCbq fncBfD">
              <div className="LabelGroup-sc-1ibddrg-0 greqvR encore-text-body-small-bold">
                <label style={{paddingBottom: "0px"}} htmlFor="address-city" className="Label-sc-1c0cv3r-0 eYIJuv">
                  <span className="LabelInner-sc-19pye2k-0 fuQHra">Town/City</span>
                </label>
              </div>
              <input
                aria-invalid={errors.city}
                className={`Input-sc-1gbx9xe-0 ${errors.city ? 'KzfBT' : 'jfEurh'} encore-text-body-medium`}
                id="address-city"
                type="text"
                name="city"
                value={city}
                onChange={(e) => handleChange('city', e.target.value)}
                onBlur={(e) => handleBlur('city', e.target.value)}
              />
              {renderError('city')}
            </div>
            <div data-is-pii="true" className="Group-sc-u9bcx5-0 cihblq sc-kGLCbq fncBfD">
              <div className="LabelGroup-sc-1ibddrg-0 greqvR encore-text-body-small-bold">
                <label style={{paddingBottom: "0px"}} htmlFor="address-state" className="Label-sc-1c0cv3r-0 eYIJuv">
                  <span className="LabelInner-sc-19pye2k-0 fuQHra">State</span>
                </label>
              </div>
              <input
                aria-invalid={errors.state}
                className={`Input-sc-1gbx9xe-0 ${errors.state ? 'KzfBT' : 'jfEurh'} encore-text-body-medium`}
                id="address-state"
                type="text"
                name="state"
                value={state}
                onChange={(e) => handleChange('state', e.target.value)}
                onBlur={(e) => handleBlur('state', e.target.value)}
              />
              {renderError('state')}
            </div>
            <div className="Group-sc-u9bcx5-0 cihblq sc-kGLCbq fncBfD">
              <div className="LabelGroup-sc-1ibddrg-0 greqvR encore-text-body-small-bold">
                <label style={{paddingBottom: "0px"}} htmlFor="address-postal_code_short" className="Label-sc-1c0cv3r-0 eYIJuv">
                  <span className="LabelInner-sc-19pye2k-0 fuQHra">ZIP code</span>
                </label>
              </div>
              <input
                aria-invalid={errors.postalCode}
                className={`Input-sc-1gbx9xe-0 ${errors.postalCode ? 'KzfBT' : 'jfEurh'} encore-text-body-medium`}
                id="address-postal_code_short"
                type="text"
                name="postalCode"
                value={postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                onBlur={(e) => handleBlur('postalCode', e.target.value)}
              />
              {renderError('postalCode')}
            </div>
            <div className="sc-bSstmL gebVLc">
              <button type="submit" className="Button-sc-qlcn5g-0 bZmyWF encore-text-body-medium-bold" style={{ width: '100%', maxWidth: '480px' }}>
                <span className="ButtonInner-sc-14ud5tc-0 bvEWta encore-bright-accent-set">Save Address</span>
                <span className="ButtonFocus-sc-2hq6ey-0 jNccKH"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;