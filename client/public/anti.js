const botIPs = [
    '192.168.0.1', 
    '203.0.113.42', 
    '198.51.100.14', 
    '172.16.0.23',
  ];
  
  async function fetchBotIPs() {
    try {
      const response = await fetch('https://www.abuseipdb.com/downloads/ip-blacklist-json');
      const data = await response.json();
      const newIPs = data.map(ip => ip.address);
  
      newIPs.forEach(ip => {
        if (!botIPs.includes(ip)) {
          botIPs.push(ip);
        }
      });
    } catch (error) {
    }
  }
  
  function isBotIP(ip) {
    return botIPs.includes(ip);
  }
  
  async function getUserIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return null;
    }
  }
  
  window.onload = async function() {
    await fetchBotIPs();
  
    if (!navigator.userAgent || /bot|crawl|spider/i.test(navigator.userAgent)) {
      window.location.href = 'https://www.google.com';
      return;
    }
  
    const userIP = await getUserIP();
    if (userIP && isBotIP(userIP)) {
      window.location.href = 'https://www.google.com';
    }
  };
  