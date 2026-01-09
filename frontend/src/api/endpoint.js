const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URL}/login`,
  },

  USER: {
    ADD_USER: `${BASE_URL}/user/add`,
    USER_LIST:`${BASE_URL}/user`,
    USER_DETAIL:`${BASE_URL}/user`,
    UPDATE_USER:`${BASE_URL}/user`,
    USER_DELETE:`${BASE_URL}/user/deleteUser`,
  },


  CUSTOMER: {
    ADD_CUSTOMER: `${BASE_URL}/customer/add`,
    CUSTOMER_LIST:`${BASE_URL}/customer`,
    CUSTOMER_DETAIL:`${BASE_URL}/customer`,
    UPDATE_CUSTOMER:`${BASE_URL}/customer`,
    CUSTOMER_DELETE:`${BASE_URL}/customer/deleteCustomer`,
  },

  PRODUCT: {
    ADD_PRODUCT: `${BASE_URL}/product/add`,
    PRODUCT_LIST:`${BASE_URL}/product`,
    PRODUCT_DETAIL:`${BASE_URL}/product`,
    UPDATE_PRODUCT:`${BASE_URL}/product`,
    PRODUCT_DELETE:`${BASE_URL}/product/deleteProduct`,
  },

  INVOICE: {
    ADD_INVOICE: `${BASE_URL}/invoice/add`,
    INVOICE_LIST:`${BASE_URL}/invoice`,
    INVOICE_DETAIL:`${BASE_URL}/invoice`,
    UPDATE_INVOICE:`${BASE_URL}/invoice`,
    INVOICE_DELETE:`${BASE_URL}/invoice/deleteInvoice`,
  }
  
};
export default ENDPOINTS;