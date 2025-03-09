import React, { useEffect, useState } from 'react';

const CookiesModal = ({ isOpen, onClose }) => {
  const [isF00Checked, setIsF00Checked] = useState(true);
  const [isM00Checked, setIsM00Checked] = useState(true);
  const [isT00Checked, setIsT00Checked] = useState(true);
  const [isI00Checked, setIsI00Checked] = useState(true);
  const [isF11Checked, setIsF11Checked] = useState(true);
  const [isM03Checked, setIsM03Checked] = useState(true);

  const handleConfirm = () => {
    onClose();
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './cookies.css';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      id="onetrust-consent-sdk"
      data-nosnippet="true"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999 }}
    >
      <div className="onetrust-pc-dark-filter ot-fade-in"></div>
      <div id="onetrust-pc-sdk" className="otPcCenter ot-fade-in" lang="en" aria-label="Preference center" role="region" style={{ height: '503.20000000000005px' }}>
        <div role="dialog" aria-modal="true" style={{ height: '100%' }} aria-label="Privacy Preference Center">
          <div className="ot-pc-header">
            <button
              id="close-pc-btn-handler"
              className="ot-close-icon"
              aria-label="Close"
              onClick={onClose}
              style={{ backgroundImage: 'url("https://cdn.cookielaw.org/logos/static/ot_close.svg")' }}
              tabIndex="0"
            />
          </div>
          {/* Close Button */}
          <div id="ot-pc-content" className="ot-pc-scrollbar ot-enbl-chr">
            <h2 id="ot-pc-title">Privacy Preference Center</h2>
            <div id="ot-pc-desc">
              When you visit any website, it may store or retrieve information on your browser, mostly in the form of cookies. This information might be about you, your preferences or your device and is mostly used to make the site work as you expect it to. The information does not usually directly identify you, but it can give you a more personalized web experience. Because we respect your right to privacy, you can choose not to allow some types of cookies. Click on the different category headings to find out more and change our default settings. However, blocking some types of cookies may impact your experience of the site and the services we are able to offer.
              <br />
              <a href="https://www.spotify.com/legal/cookies-policy/" className="privacy-notice-link" rel="noopener" target="_blank" aria-label="More information about your privacy, opens in a new tab" tabIndex="0">
                Cookie Policy
              </a>
            </div>
            <section className="ot-sdk-row ot-cat-grp">
              <h3 id="ot-category-title"> Manage Consent Preferences</h3>
              <div className="ot-accordion-layout ot-cat-item ot-vs-config" data-optanongroupid="s00">
                <button aria-expanded="false" ot-accordion="true" aria-controls="ot-desc-id-s00" aria-labelledby="ot-header-id-s00"></button>
                <div className="ot-acc-hdr ot-always-active-group">
                  <h4 className="ot-cat-header" id="ot-header-id-s00">Strictly Necessary Cookies</h4>
                  <div id="ot-status-id-s00" className="ot-always-active">Always Active</div>
                  <div className="ot-arw-cntr">
                    <svg className="ot-arw" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="caret-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
                      <path fill="currentColor" d="M166.9 264.5l-117.8 116c-4.7 4.7-12.3 4.7-17 0l-7.1-7.1c-4.7-4.7-4.7-12.3 0-17L127.3 256 25.1 155.6c-4.7-4.7-4.7-12.3 0-17l7.1-7.1c4.7-4.7 12.3-4.7 17 0l117.8 116c4.6 4.7 4.6 12.3-.1 17z"></path>
                    </svg>
                  </div>
                </div>
                {/* accordion detail */}
              </div>
              <div className="ot-accordion-layout ot-cat-item ot-vs-config" data-optanongroupid="f00">
                <button aria-expanded="false" ot-accordion="true" aria-controls="ot-desc-id-f00" aria-labelledby="ot-header-id-f00"></button>
                {/* Accordion header */}
                <div className="ot-acc-hdr">
                  <h4 className="ot-cat-header" id="ot-header-id-f00">First Party Functional Cookies</h4>
                  <div className="ot-tgl">
                    <input type="checkbox" name="ot-group-id-f00" id="ot-group-id-f00" role="switch" className="category-switch-handler" data-optanongroupid="f00" checked={isF00Checked} onChange={() => setIsF00Checked(!isF00Checked)} aria-labelledby="ot-header-id-f00" tabIndex="0" />
                    <label className="ot-switch" htmlFor="ot-group-id-f00">
                      <span className="ot-switch-nob"></span> <span className="ot-label-txt">First Party Functional Cookies</span>
                    </label>
                  </div>
                  <div className="ot-arw-cntr">
                    <svg className="ot-arw" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="caret-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
                      <path fill="currentColor" d="M166.9 264.5l-117.8 116c-4.7 4.7-12.3 4.7-17 0l-7.1-7.1c-4.7-4.7-4.7-12.3 0-17L127.3 256 25.1 155.6c-4.7-4.7-4.7-12.3 0-17l7.1-7.1c4.7-4.7 12.3-4.7 17 0l117.8 116c4.6 4.7 4.6 12.3-.1 17z"></path>
                    </svg>
                  </div>
                </div>
                {/* accordion detail */}
                <div className="ot-acc-grpcntr ot-acc-txt">
                  <p className="ot-acc-grpdesc ot-category-desc" id="ot-desc-id-f00">
                    These cookies enable us to provide enhanced functionality and personalisation. If you do not allow these cookies then some or all of these services may not function properly.
                  </p>
                </div>
              </div>
              <div className="ot-accordion-layout ot-cat-item ot-vs-config" data-optanongroupid="m00">
                <button aria-expanded="false" ot-accordion="true" aria-controls="ot-desc-id-m00" aria-labelledby="ot-header-id-m00"></button>
                {/* Accordion header */}
                <div className="ot-acc-hdr">
                  <h4 className="ot-cat-header" id="ot-header-id-m00">First Party Performance Cookies</h4>
                  <div className="ot-tgl">
                    <input type="checkbox" name="ot-group-id-m00" id="ot-group-id-m00" role="switch" className="category-switch-handler" data-optanongroupid="m00" checked={isM00Checked} onChange={() => setIsM00Checked(!isM00Checked)} aria-labelledby="ot-header-id-m00" tabIndex="0" />
                    <label className="ot-switch" htmlFor="ot-group-id-m00">
                      <span className="ot-switch-nob"></span> <span class="ot-label-txt">First Party Performance Cookies</span>
                    </label>
                  </div>
                  <div className="ot-arw-cntr">
                    <svg className="ot-arw" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="caret-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
                      <path fill="currentColor" d="M166.9 264.5l-117.8 116c-4.7 4.7-12.3 4.7-17 0l-7.1-7.1c-4.7-4.7-4.7-12.3 0-17L127.3 256 25.1 155.6c-4.7-4.7-4.7-12.3 0-17l7.1-7.1c4.7-4.7 12.3-4.7 17 0l117.8 116c4.6 4.7 4.6 12.3-.1 17z"></path>
                    </svg>
                  </div>
                </div>
                {/* accordion detail */}
              </div>
              <div className="ot-accordion-layout ot-cat-item ot-vs-config" data-optanongroupid="t00">
                <button aria-expanded="false" ot-accordion="true" aria-controls="ot-desc-id-t00" aria-labelledby="ot-header-id-t00"></button>
                {/* Accordion header */}
                <div className="ot-acc-hdr">
                  <h4 className="ot-cat-header" id="ot-header-id-t00"> First Party Targeting Cookies</h4>
                  <div className="ot-tgl">
                    <input type="checkbox" name="ot-group-id-t00" id="ot-group-id-t00" role="switch" className="category-switch-handler" data-optanongroupid="t00" checked={isT00Checked} onChange={() => setIsT00Checked(!isT00Checked)} aria-labelledby="ot-header-id-t00" tabIndex="0" />
                    <label className="ot-switch" htmlFor="ot-group-id-t00">
                      <span className="ot-switch-nob"></span> <span className="ot-label-txt"> First Party Targeting Cookies</span>
                    </label>
                  </div>
                  <div className="ot-arw-cntr">
                    <svg className="ot-arw" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="caret-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
                      <path fill="currentColor" d="M166.9 264.5l-117.8 116c-4.7 4.7-12.3 4.7-17 0l-7.1-7.1c-4.7-4.7-4.7-12.3 0-17L127.3 256 25.1 155.6c-4.7-4.7-4.7-12.3 0-17l7.1-7.1c4.7-4.7 12.3-4.7 17 0l117.8 116c4.6 4.7 4.6 12.3-.1 17z"></path>
                    </svg>
                  </div>
                </div>
                {/* accordion detail */}
              </div>
              <div className="ot-accordion-layout ot-cat-item ot-vs-config" data-optanongroupid="i00">
                <button aria-expanded="false" ot-accordion="true" aria-controls="ot-desc-id-i00" aria-labelledby="ot-header-id-i00"></button>
                {/* Accordion header */}
                <div className="ot-acc-hdr">
                  <h4 className="ot-cat-header" id="ot-header-id-i00">Store and access information on a device</h4>
                  <div className="ot-tgl">
                    <input type="checkbox" name="ot-group-id-i00" id="ot-group-id-i00" role="switch" className="category-switch-handler" data-optanongroupid="i00" checked={isI00Checked} onChange={() => setIsI00Checked(!isI00Checked)} aria-labelledby="ot-header-id-i00" tabIndex="0" />
                    <label className="ot-switch" htmlFor="ot-group-id-i00">
                      <span className="ot-switch-nob"></span> <span className="ot-label-txt">Store and access information on a device</span>                    </label>                  </div>                  <div className="ot-arw-cntr">
                    <svg className="ot-arw" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="caret-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
                      <path fill="currentColor" d="M166.9 264.5l-117.8 116c-4.7 4.7-12.3 4.7-17 0l-7.1-7.1c-4.7-4.7-4.7-12.3 0-17L127.3 256 25.1 155.6c-4.7-4.7-4.7-12.3 0-17l7.1-7.1c4.7-4.7 12.3-4.7 17 0l117.8 116c4.6 4.7 4.6 12.3-.1 17z"></path>
                    </svg>
                  </div>
                </div>
                {/* accordion detail */}
              </div>
              <div className="ot-accordion-layout ot-cat-item ot-vs-config" data-optanongroupid="f11">
                <button aria-expanded="false" ot-accordion="true" aria-controls="ot-desc-id-f11" aria-labelledby="ot-header-id-f11"></button>
                {/* Accordion header */}
                <div className="ot-acc-hdr">
                  <h4 className="ot-cat-header" id="ot-header-id-f11">Content Selection, Delivery, and Reporting</h4>
                  <div className="ot-tgl">
                    <input type="checkbox" name="ot-group-id-f11" id="ot-group-id-f11" role="switch" className="category-switch-handler" data-optanongroupid="f11" checked={isF11Checked} onChange={() => setIsF11Checked(!isF11Checked)} aria-labelledby="ot-header-id-f11" tabIndex="0" />
                    <label className="ot-switch" htmlFor="ot-group-id-f11">
                      <span className="ot-switch-nob"></span> <span className="ot-label-txt">Content Selection, Delivery, and Reporting</span>
                    </label>
                  </div>
                  <div className="ot-arw-cntr">
                    <svg className="ot-arw" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="caret-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
                      <path fill="currentColor" d="M166.9 264.5l-117.8 116c-4.7 4.7-12.3 4.7-17 0l-7.1-7.1c-4.7-4.7-4.7-12.3 0-17L127.3 256 25.1 155.6c-4.7-4.7-4.7-12.3 0-17l7.1-7.1c4.7-4.7 12.3-4.7 17 0l117.8 116c4.6 4.7 4.6 12.3-.1 17z"></path>
                    </svg>
                  </div>
                </div>
                {/* accordion detail */}
              </div>
              <div className="ot-accordion-layout ot-cat-item ot-vs-config" data-optanongroupid="m03">
                <button aria-expanded="false" ot-accordion="true" aria-controls="ot-desc-id-m03" aria-labelledby="ot-header-id-m03"></button>
                {/* Accordion header */}
                <div className="ot-acc-hdr">
                  <h4 className="ot-cat-header" id="ot-header-id-m03">Match and combine data from other sources</h4>
                  <div className="ot-tgl">
                    <input type="checkbox" name="ot-group-id-m03" id="ot-group-id-m03" role="switch" className="category-switch-handler" data-optanongroupid="m03" checked={isM03Checked} onChange={() => setIsM03Checked(!isM03Checked)} aria-labelledby="ot-header-id-m03" tabIndex="0" />
                    <label className="ot-switch" htmlFor="ot-group-id-m03">
                      <span className="ot-switch-nob"></span> <span className="ot-label-txt">Match and combine data from other sources</span>
                    </label>
                  </div>
                  <div className="ot-arw-cntr">
                    <svg className="ot-arw" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="caret-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512">
                      <path fill="currentColor" d="M166.9 264.5l-117.8 116c-4.7 4.7-12.3 4.7-17 0l-7.1-7.1c-4.7-4.7-4.7-12.3 0-17L127.3 256 25.1 155.6c-4.7-4.7-4.7-12.3 0-17l7.1-7.1c4.7-4.7 12.3-4.7 17 0l117.8 116c4.6 4.7 4.6 12.3-.1 17z"></path>
                    </svg>
                  </div>
                </div>
                {/* accordion detail */}
              </div>
            </section>
          </div>
          <div className="ot-pc-footer ot-pc-scrollbar">
            <div className="ot-btn-container">
              <button
                className="save-preference-btn-handler onetrust-close-btn-handler"
                tabIndex="0"
                onClick={handleConfirm}
              >
                Confirm My Choices
              </button>
            </div>
            {/* Footer logo */}
            <div className="ot-pc-footer-logo">
              <a href="https://www.onetrust.com/products/cookie-consent/" target="_blank" rel="noopener noreferrer" aria-label="Powered by OneTrust Opens in a new Tab" tabIndex="0">
                <img alt="Powered by Onetrust" src="https://cdn.cookielaw.org/logos/static/powered_by_logo.svg" title="Powered by OneTrust Opens in a new Tab" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesModal;