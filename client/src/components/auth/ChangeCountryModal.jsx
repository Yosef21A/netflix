import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './changeCountry.css';

const countriesList = [
  "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
  "Botswana", "Brazil", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
  "Chad", "Chile", "Colombia", "Comoros", "Costa Rica", "Cote d'Ivoire", "Croatia", "Curacao", "Cyprus", "Czech Republic",
  "Democratic Republic of Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
  "Equatorial Guinea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Georgia", "Germany", "Ghana",
  "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland",
  "India", "Indonesia", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
  "Kosovo", "Kuwait", "Kyrgyz Republic", "Lao PDR", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
  "Luxembourg", "Macao SAR, China", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
  "Mauritius", "Mexico", "Micronesia, Fed. Sts.", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Republic of the Congo", "Romania", "Russia", "Rwanda", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "South Africa", "South Korea",
  "Spain", "Sri Lanka", "St. Kitts and Nevis", "St. Lucia", "St. Vincent and the Grenadines", "Suriname", "Sweden", "Switzerland",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "The Bahamas", "The Gambia", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago",
  "Tunisia", "Turkey", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Venezuela, RB", "Vietnam", "Zambia", "Zimbabwe"
];

const ChangeCountryModal = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const history = useHistory();

  const filteredCountries = countriesList.filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountrySelect = (country) => {
    //history.push(`/verif`);
    onClose();
  };

  return (
    <div className="OverlayBackdrop-sc-1vbts8w-0 iDXLwm encore-over-media-set">
      <div className="Container-sc-1eu55v9-0 cvZiHB encore-base-set sc-7b962dad-1 jhoSKo">
        <header className="Header-sc-5nwm8m-0 cvHwM">
          <h1 className="encore-text encore-text-body-medium-bold HeaderTitle-sc-1903a40-0 gYEdWW">Choose your country</h1>
          <span className="encore-text encore-text-body-medium encore-internal-color-text-subdued Subtitle-sc-phhz2w-0 iPcebT">
            <input
              className="Input-sc-1gbx9xe-0 fphuuP encore-text-body-medium"
              placeholder="Find your country"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </span>
          <button type="button" className="Button-sc-1dqy6lx-0 dizVpH CloseButton-sc-abn00m-0 hripiO" onClick={onClose}>
            <span className="IconWrapper__Wrapper-sc-16usrgb-0 gpFeMd">
              <svg viewBox="0 0 24 24" className="Svg-sc-ytk21e-0 dVlSVd">
                <path d="M3.293 3.293a1 1 0 0 1 1.414 0L12 10.586l7.293-7.293a1 1 0 1 1 1.414 1.414L13.414 12l7.293 7.293a1 1 0 0 1-1.414 1.414L12 13.414l-7.293 7.293a1 1 0 0 1-1.414-1.414L10.586 12 3.293 4.707a1 1 0 0 1 0-1.414z"></path>
              </svg>
            </span>
          </button>
        </header>
        <div className="Body-sc-aotjrb-0 ebNqNC">
          <div className="sc-7b962dad-0 VeOmN">
            {filteredCountries.map((country, index) => (
              <a
                key={index}
                className="Link-sc-k8gsk-0 jVkpyL sc-7b962dad-2 gsuXxN"
                style={{ fontWeight: 'normal' }}
                onClick={() => handleCountrySelect(country)}
              >
                {country}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeCountryModal;