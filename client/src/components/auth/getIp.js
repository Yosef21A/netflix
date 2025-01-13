import axios from 'axios';

const apis = [
  'https://ipinfo.io/json',
  'https://ipapi.co/json',
  'https://ipwhois.app/json/',
  'https://freegeoip.app/json/',
  'https://geoip-db.com/json/'
];

const getIpInfo = async () => {
  for (const api of apis) {
    try {
      const response = await axios.get(api);
      if (response.data && response.data.ip) {
        return response.data;
      }
    } catch (error) {
      console.error(`Failed to fetch data from ${api}:`, error);
    }
  }
  throw new Error('All IP APIs failed');
};

export default getIpInfo;