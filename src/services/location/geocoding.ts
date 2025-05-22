import axios from 'axios';

export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const response = await axios.get(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );

    const { city, principalSubdivision, countryName } = response.data;
    
    // Format as "city, state" or "city, country" if state is not available
    let formattedAddress = city || 'Unknown location';
    
    if (principalSubdivision) {
      formattedAddress += `, ${principalSubdivision}`;
    } else if (countryName) {
      formattedAddress += `, ${countryName}`;
    }
    
    return formattedAddress;
  } catch (error) {
    console.error('Geocoding error:', error);
    return 'Unknown location';
  }
}