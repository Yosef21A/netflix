import React, { useState , useEffect } from 'react';

const Footer = () => {
    const [styles, setStyles] = useState(null);
  
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
  return (
    <footer className="footer footerStayPut">
      <div className="legalFooter">
        <ul className="footerGroup">
          <li>
            <a target="_blank" href="https://www.paypal.com/cshelp/contact-us" pa-marked="1">
              Contact Us
            </a>
          </li>
          <li>
            <a target="_blank" href="https://www.paypal.com/legalhub/paypal/privacy-full" pa-marked="1">
              Privacy
            </a>
          </li>
          <li>
            <a target="_blank" href="https://www.paypal.com/legalhub/paypal/home" pa-marked="1">
              Legal
            </a>
          </li>
          <li>
            <a target="_blank" href="https://www.paypal.com/legalhub/paypal/upcoming-policies-full" pa-marked="1">
              Policy Updates
            </a>
          </li>
          <li>
            <a target="_blank" href="https://www.paypal.com/webapps/mpp/country-worldwide" pa-marked="1">
              Worldwide
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;