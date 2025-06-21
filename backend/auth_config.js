module.exports = {
  // JWT Secret - MUST be same for sign and verify!
  secret: "skriveni kljuc", 
  
  // Optional configuration
  jwtExpiration: 3600,        // 1 hour in seconds
  jwtRefreshExpiration: 86400, // 24 hours in seconds
  
  // Algorithm for JWT
  algorithm: 'HS256',
  
  // Issuer info (optional)
  issuer: 'iooa-forum-2025',
  
  // Audience (optional)
  audience: 'iooa-students'
};

// Export for ES6 modules if needed
module.exports.default = module.exports;