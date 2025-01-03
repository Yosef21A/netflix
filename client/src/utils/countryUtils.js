export const getCountryCode = async (countryCode) => {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
    const data = await response.json();
    // Get the dialing code (e.g., +1, +44, etc.)
    return data[0]?.idd?.root + (data[0]?.idd?.suffixes?.[0] || '');
  } catch (error) {
    console.error('Error fetching country code:', error);
    return '+1'; // Default to US code
  }
};
