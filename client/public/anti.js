(async function () {
  const IP_STORAGE_KEY = "userIP";
  const COUNTRY_STORAGE_KEY = "country";

  // Check if IP is already stored
  let userIP = localStorage.getItem(IP_STORAGE_KEY);
  let userCountry = localStorage.getItem(COUNTRY_STORAGE_KEY);

  if (!userIP || !userCountry) {
    console.log("🔍 Fetching user IP and country...");
    try {
      const response = await fetch("https://ipinfo.io/json");
      const data = await response.json();
      
      userIP = data.ip;
      userCountry = data.country;

      localStorage.setItem(IP_STORAGE_KEY, userIP);
      localStorage.setItem(COUNTRY_STORAGE_KEY, userCountry);

      console.log(`✅ IP stored: ${userIP}, Country stored: ${userCountry}`);
    } catch (error) {
      console.error("❌ Failed to fetch IP and country:", error);
      userIP = "Unknown IP";
      userCountry = "Unknown Country"; // Fallback if API fails
    }
  } else {
    console.log(`✅ Using cached IP: ${userIP}, Country: ${userCountry}`);
  }
  window.userIP = userIP;

})();
