const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URL}/login`,
  },
  CUSTOMER: {
    ADD_CUSTOMER: `${BASE_URL}/customer/add`,
    CUSTOMER_LIST:`${BASE_URL}/customer`,
    CUSTOMER_DETAIL:`${BASE_URL}/customer`,
    UPDATE_CUSTOMER:`${BASE_URL}/customer`,
    CUSTOMER_DELETE:`${BASE_URL}/customer/deleteCustomer`,
  }
  
};
export default ENDPOINTS;