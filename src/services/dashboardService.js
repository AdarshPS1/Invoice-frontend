import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Get monthly revenue and invoice data
export const getMonthlyData = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/monthly-data`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    throw error;
  }
};

// Get payment status data
export const getPaymentStatusData = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/payment-status`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw error;
  }
}; 