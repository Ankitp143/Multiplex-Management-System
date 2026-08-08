import api from './api';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  getAllUsers: () => api.get('/auth/users'),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
};

export const movieAPI = {
  getAll: (params) => api.get('/movies', { params }),
  getById: (id) => api.get(`/movies/${id}`),
  create: (data) => api.post('/movies', data),
  update: (id, data) => api.put(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`),
};

export const theatreAPI = {
  getAll: (params) => api.get('/theatres', { params }),
  getById: (id) => api.get(`/theatres/${id}`),
  create: (data) => api.post('/theatres', data),
  update: (id, data) => api.put(`/theatres/${id}`, data),
  delete: (id) => api.delete(`/theatres/${id}`),
};

export const screenAPI = {
  getByTheatre: (theatreId) => api.get(`/screens/theatre/${theatreId}`),
  getById: (id) => api.get(`/screens/${id}`),
  create: (data) => api.post('/screens', data),
  update: (id, data) => api.put(`/screens/${id}`, data),
  delete: (id) => api.delete(`/screens/${id}`),
};

export const showAPI = {
  getAll: (params) => api.get('/shows', { params }),
  getById: (id) => api.get(`/shows/${id}`),
  create: (data) => api.post('/shows', data),
  update: (id, data) => api.put(`/shows/${id}`, data),
  delete: (id) => api.delete(`/shows/${id}`),
  lockSeats: (showId, seatNos) => api.post(`/shows/${showId}/lock-seats`, { seatNos }),
};

export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getUserBookings: () => api.get('/bookings/user'),
  getAllBookings: () => api.get('/bookings/all'),
  getById: (id) => api.get(`/bookings/${id}`),
};

export const paymentAPI = {
  process: (data) => api.post('/payments/process', data),
  getByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),
};

export const ticketAPI = {
  getByBooking: (bookingId) => api.get(`/tickets/booking/${bookingId}`),
  verify: (ticketNumber) => api.post('/tickets/verify', { ticketNumber }),
};

export const cancellationAPI = {
  request: (data) => api.post('/cancellations/request', data),
  getMyCancellations: () => api.get('/cancellations/my-cancellations'),
  getAll: () => api.get('/cancellations/all'),
};

export const snackAPI = {
  getAll: (params) => api.get('/snacks', { params }),
  getById: (id) => api.get(`/snacks/${id}`),
  create: (data) => api.post('/snacks', data),
  update: (id, data) => api.put(`/snacks/${id}`, data),
  delete: (id) => api.delete(`/snacks/${id}`),
};

export const foodOrderAPI = {
  create: (data) => api.post('/food-orders', data),
  getMyOrders: () => api.get('/food-orders/user'),
  getAllOrders: () => api.get('/food-orders/all'),
  updateStatus: (id, status) => api.put(`/food-orders/${id}/status`, { status }),
};

export const couponAPI = {
  getAll: () => api.get('/coupons'),
  validate: (data) => api.post('/coupons/validate', data),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

export const reviewAPI = {
  getByMovie: (movieId) => api.get(`/reviews/movie/${movieId}`),
  add: (data) => api.post('/reviews', data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const reportAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getRevenue: (params) => api.get('/reports/revenue', { params }),
};
