import React, { useState } from "react";
import "./ccForm.css";

const CARD_TYPES = {
  visa: /^4[0-9]{0,15}$/,
  mastercard: /^5[1-5][0-9]{0,14}$/,
  amex: /^3[47][0-9]{0,13}$/,
  discover: /^6(?:011|5[0-9]{2})[0-9]{0,12}$/
};

const CCForm = ({ cardData, onCardDataChange }) => {
  const [errors, setErrors] = useState({
    cardNumber: false,
    expiryDate: false,
    securityCode: false
  });

  const [cardType, setCardType] = useState("");

  const detectCardType = (number) => {
    for (let [type, regex] of Object.entries(CARD_TYPES)) {
      if (regex.test(number.replace(/\s+/g, ""))) return type;
    }
    return "";
  };

  const validateCardNumber = (number) => {
    const cleanNumber = number.replace(/\s+/g, "");
    if (!/^[0-9]{13,19}$/.test(cleanNumber)) return "Enter a valid credit card number.";

    let sum = 0;
    let shouldDouble = false;
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0 ? "" : "Enter a valid credit card number.";
  };

  const validateExpiryDate = (date) => {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(date)) return "Enter a valid expiry date.";

    const [month, year] = date.split("/");
    const expiryDate = new Date(`20${year}`, month - 1);
    const currentDate = new Date();
    if (expiryDate <= currentDate) return "This card has expired.";
    return "";
  };

  const validateSecurityCode = (code, type) => {
    const length = type === "amex" ? 4 : 3;
    const regex = new RegExp(`^[0-9]{${length}}$`);
    return regex.test(code)
      ? ""
      : type === "amex"
      ? "Enter the 4 digit code on the front of your card. "
      : "Enter the 3 digit code on the back of your card.";
  };

  const formatInputValue = (name, value) => {
    if (name === "cardNumber") {
      return value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
    }
    if (name === "expiryDate") {
      const cleanValue = value.replace(/\D/g, "").slice(0, 4);

      if (cleanValue.length === 1 && parseInt(cleanValue, 10) > 1 && parseInt(cleanValue, 10) < 10) {
        return `0${cleanValue}`;
      }

      // Add "/" after the first two digits
      return cleanValue.length > 2
        ? `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}`
        : cleanValue;
    }
    return value;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const formattedValue = formatInputValue(name, value);

    if (name === "cardNumber") {
      const detectedType = detectCardType(formattedValue);
      setCardType(detectedType);
    }

    onCardDataChange({ ...cardData, [name]: formattedValue });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = "";

    switch (name) {
      case "cardNumber":
        error = validateCardNumber(value);
        break;
      case "expiryDate":
        error = validateExpiryDate(value);
        break;
      case "securityCode":
        error = validateSecurityCode(value, cardType);
        break;
      default:
        break;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error
    }));
  };

  return (
    <div className="pci-body">
      <div className="row">
        <div className="input-form-group" style={{ paddingBottom: "24px" }}>
          <span id="provider-icons">
            <span
              className={`icon-provider visa ${
                cardType === "visa" ? "" : "disabled"
              }`}
              data-type="visa"
            ></span>
            <span
              className={`icon-provider mastercard ${
                cardType === "mastercard" ? "" : "disabled"
              }`}
              data-type="mastercard"
            ></span>
            <span
              className={`icon-provider amex ${
                cardType === "amex" ? "" : "disabled"
              }`}
              data-type="amex"
            ></span>
            <span
              className={`icon-provider discover ${
                cardType === "discover" ? "" : "disabled"
              }`}
              data-type="discover"
            ></span>
          </span>
          <input
            id="cardnumber"
            name="cardNumber"
            autoComplete="cc-number"
            type="tel"
            placeholder="0000 0000 0000 0000"
            value={cardData.cardNumber}
            onChange={handleInputChange}
            onBlur={handleBlur}
            maxLength="19"
            className={errors.cardNumber ? "invalid-input" : ""}
            aria-invalid={!!errors.cardNumber}
            aria-describedby="cardnumber-error"
          />
          <label
            id="trans-cardnumber"
            htmlFor="cardnumber"
            className="card-label"
          >
            Card number
          </label>
          {errors.cardNumber && (
            <p
              id="cardnumber-error"
              className="field-error"
              aria-live="assertive"
              style={{
                display: "flex",
              }}
            >
              {errors.cardNumber}
            </p>
          )}
        </div>
      </div>
      <div className="row">
        <div className="input-form-group" style={{ paddingBottom: "24px" }}>
          <input
            id="expiry-date"
            name="expiryDate"
            type="tel"
            autoComplete="cc-exp"
            placeholder="MM / YY"
            value={cardData.expiryDate}
            onChange={handleInputChange}
            onBlur={handleBlur}
            maxLength="5"
            className={errors.expiryDate ? "invalid-input" : ""}
            aria-invalid={!!errors.expiryDate}
            aria-describedby="expiry-date-error"
          />
          <label id="trans-expiration_date" htmlFor="expiry-date">
            Expiry date
          </label>
          {errors.expiryDate && (
            <p
              id="expiry-date-error"
              className="field-error"
              aria-live="assertive"
              style={{
                display: "flex",
              }}
            >
              {errors.expiryDate}
            </p>
          )}
        </div>
        <div className="input-form-group" style={{ paddingBottom: "24px" }}>
          <input
            id="security-code"
            name="securityCode"
            autoComplete="off"
            type="tel"
            placeholder="CVC"
            value={cardData.securityCode}
            onChange={handleInputChange}
            onBlur={handleBlur}
            maxLength={cardType === "amex" ? 4 : 3}
            className={errors.securityCode ? "invalid-input" : ""}
            aria-invalid={!!errors.securityCode}
            aria-describedby="security-code-error"
          />
          <label id="trans-security_code" htmlFor="security-code">
            Security code
          </label>
          <p className="field-error" >555</p>
          {errors.securityCode && (
            <p
              id="security-code-error"
              className="field-error"
              aria-live="assertive"
              style={{
                display: "flex",
              }}
            >
              {errors.securityCode}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CCForm;