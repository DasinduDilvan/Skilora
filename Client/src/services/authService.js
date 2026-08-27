// Dummy auth service — REPLACE with real API calls when backend is ready.
// Example future replacement: axios.post(`${API_URL}/auth/register`, data)

const MOCK_DELAY = 1000;

const mockUsers = {
  'client@skillora.lk': { password: 'password', role: 'client', redirect: '/client-dashboard' },
  'freelancer@skillora.lk': { password: 'password', role: 'freelancer', redirect: '/freelancer-dashboard' },
  'admin@skillora.lk': { password: 'password', role: 'admin', redirect: '/admin-dashboard' },
};

export const registerUser = (userData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate API success
      console.log('[Mock Register]', userData);
      resolve({
        success: true,
        message: 'Account created successfully!',
        user: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role,
        },
      });
    }, MOCK_DELAY);
  });
};

export const loginUser = ({ email, password }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = mockUsers[email];
      if (user && user.password === password) {
        resolve({
          success: true,
          message: 'Login successful!',
          redirect: user.redirect,
          token: 'dummy-jwt-token',
        });
      } else if (user) {
        // For demo purposes: allow any password for known emails
        resolve({
          success: true,
          message: 'Login successful!',
          redirect: user.redirect,
          token: 'dummy-jwt-token',
        });
      } else {
        resolve({ success: false, message: 'Invalid email or password.' });
      }
    }, MOCK_DELAY);
  });
};