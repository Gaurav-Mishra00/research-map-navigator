import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const optimizeRoute = async (coordinates, profile = 'driving') => {
  try {
    const response = await axios.post(`${API_URL}/optimize-route`, {
      coordinates,
      profile
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
