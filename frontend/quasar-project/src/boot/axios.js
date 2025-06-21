import { boot } from 'quasar/wrappers'
import axios from 'axios'

console.log('🚀 Axios boot file loading...');

// ✅ API instance for local server
const api = axios.create({ 
  baseURL: 'http://localhost:3000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

console.log('🌐 API instance created with baseURL:', api.defaults.baseURL);

export default boot(({ app }) => {
  console.log('🔧 Configuring axios in Quasar app...');
  
  // For Options API
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
  
  console.log('✅ Axios configured in app.config.globalProperties');
})

// ✅ REQUEST INTERCEPTOR - automatically adds token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    
    console.log('🔄 API Request interceptor triggered:');
    console.log('  📍 Method:', config.method?.toUpperCase());
    console.log('  📍 URL:', config.url);
    console.log('  📍 Full URL:', config.baseURL + config.url);
    console.log('  🎟️ Token from localStorage:', token ? 'EXISTS' : 'MISSING');
    console.log('  🎟️ Token length:', token ? token.length : 0);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('  ✅ Token added to Authorization header');
      console.log('  🎯 Authorization header:', config.headers.Authorization?.substring(0, 50) + '...');
    } else {
      console.log('  ⚠️ No token available to add');
      // Remove Authorization header if no token
      delete config.headers.Authorization;
    }
    
    console.log('  📤 Final request headers:');
    console.log('    Authorization:', config.headers.Authorization ? 'SET' : 'NOT SET');
    console.log('    Content-Type:', config.headers['Content-Type']);
    
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error)
  }
)

// ✅ RESPONSE INTERCEPTOR - handle common errors and success
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response interceptor - SUCCESS:');
    console.log('  ✅ Status:', response.status);
    console.log('  📍 URL:', response.config.url);
    console.log('  📊 Data type:', typeof response.data);
    
    if (response.data && response.data.success !== undefined) {
      console.log('  🎯 Success flag:', response.data.success);
    }
    
    return response
  },
  (error) => {
    console.error('❌ API Response interceptor - ERROR:');
    console.error('  📍 URL:', error.config?.url);
    console.error('  🔢 Status:', error.response?.status);
    console.error('  💬 Status text:', error.response?.statusText);
    console.error('  📋 Error data:', error.response?.data);
    console.error('  🔍 Error message:', error.message);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.warn('🔓 401 Unauthorized - token možda nije valjan ili je istekao');
      
      // Check if it's an expired token
      if (error.response?.data?.error === 'TokenExpiredError') {
        console.warn('⏰ Token je istekao - potrebna nova prijava');
        // You could redirect to login page here if needed
        // window.location.href = '/login';
      }
      
    } else if (error.response?.status === 403) {
      console.warn('🚫 403 Forbidden - nema dozvolu za ovu akciju');
      
      if (error.response?.data?.error === 'NO_TOKEN') {
        console.warn('🎟️ Token nedostaje - potrebna prijava');
      }
      
    } else if (error.response?.status === 404) {
      console.warn('🔍 404 Not Found - resurs nije pronađen');
      
    } else if (error.response?.status === 500) {
      console.error('💥 500 Server Error - greška na serveru');
      
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout - server ne odgovara');
      
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('🌐 Network error - nema internetske veze');
    }
    
    return Promise.reject(error)
  }
)

console.log('🔄 API interceptors configured successfully');
console.log('📋 Interceptor features:');
console.log('  🎟️ Automatic token injection');
console.log('  📊 Request/response logging');
console.log('  ❌ Comprehensive error handling');
console.log('  ⏰ Timeout handling (15s)');

export { api }