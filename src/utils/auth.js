// Get token from localStorage
export const getToken = () => {
    return localStorage.getItem('token');
  };
  
  // Check if the user is authenticated
  export const isAuthenticated = () => {
    return !!getToken(); // Returns true if token exists
  };
  
  // Remove token (for logout)
  export const logout = () => {
    localStorage.removeItem('token');
  };
  