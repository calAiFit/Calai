import axios from 'axios';


const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});


api.interceptors.request.use(
  (config) => {
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    
    if (error?.response?.status === 401) {

      console.log('Authentication required');
    } else {
     
      console.error('API Error:', error);
    }
    
    return Promise.reject(error);
  }
);

export default api;
