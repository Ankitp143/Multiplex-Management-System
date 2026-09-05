import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute';
import Layout from './components/common/Layout';
import NotFound from './pages/NotFound';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Public pages
import HomePage from './pages/public/HomePage';
import MovieDetailPage from './pages/public/MovieDetailPage';
import MoviesListPage from './pages/public/MoviesListPage';
import TheatresListPage from './pages/public/TheatresListPage';

// Customer pages
import BookingHistoryPage from './pages/customer/BookingHistoryPage';
import BookingSuccessPage from './pages/customer/BookingSuccessPage';
import PaymentPage from './pages/customer/PaymentPage';
import SeatSelectionPage from './pages/customer/SeatSelectionPage';
import TicketViewPage from './pages/customer/TicketViewPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMoviesPage from './pages/admin/AdminMoviesPage';
import AdminTheatresPage from './pages/admin/AdminTheatresPage';
import AdminShowsPage from './pages/admin/AdminShowsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminSnacksPage from './pages/admin/AdminSnacksPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';

// Theatre Owner pages
import OwnerDashboard from './pages/admin/OwnerDashboard';

// Staff pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffVerificationPage from './pages/staff/StaffVerificationPage';
import StaffFoodOrdersPage from './pages/staff/StaffFoodOrdersPage';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/movies" element={<MoviesListPage />} />
      <Route path="/theatres" element={<TheatresListPage />} />
      <Route path="/movie/:id" element={<MovieDetailPage />} />
      <Route path="/movies/:id" element={<MovieDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected routes — guard then layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Customer routes */}
          <Route path="/booking-history" element={<BookingHistoryPage />} />
          <Route path="/customer/bookings" element={<BookingHistoryPage />} />
          <Route path="/select-seat/:showId" element={<SeatSelectionPage />} />
          <Route path="/select-seats/:showId" element={<SeatSelectionPage />} />
          <Route path="/payment/:bookingId" element={<PaymentPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/booking-success/:bookingId" element={<BookingSuccessPage />} />
          <Route path="/booking-success" element={<BookingSuccessPage />} />
          <Route path="/ticket/:bookingId" element={<TicketViewPage />} />
          <Route path="/ticket" element={<TicketViewPage />} />

          {/* Admin routes */}
          <Route path="/admin" element={<RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute>} />
          <Route path="/admin/dashboard" element={<RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute>} />
          <Route path="/admin/movies" element={<RoleRoute roles={['admin']}><AdminMoviesPage /></RoleRoute>} />
          <Route path="/admin/theatres" element={<RoleRoute roles={['admin', 'theatre_owner']}><AdminTheatresPage /></RoleRoute>} />
          <Route path="/admin/screens" element={<RoleRoute roles={['admin', 'theatre_owner']}><AdminTheatresPage /></RoleRoute>} />
          <Route path="/admin/shows" element={<RoleRoute roles={['admin', 'theatre_owner']}><AdminShowsPage /></RoleRoute>} />
          <Route path="/admin/users" element={<RoleRoute roles={['admin', 'theatre_owner']}><AdminUsersPage /></RoleRoute>} />
          <Route path="/admin/bookings" element={<RoleRoute roles={['admin', 'theatre_owner']}><AdminBookingsPage /></RoleRoute>} />
          <Route path="/admin/snacks" element={<RoleRoute roles={['admin']}><AdminSnacksPage /></RoleRoute>} />
          <Route path="/admin/coupons" element={<RoleRoute roles={['admin']}><AdminCouponsPage /></RoleRoute>} />
          <Route path="/admin/reports" element={<RoleRoute roles={['admin', 'theatre_owner']}><AdminDashboard /></RoleRoute>} />

          {/* Theatre Owner routes */}
          <Route path="/owner" element={<RoleRoute roles={['theatre_owner', 'admin']}><OwnerDashboard /></RoleRoute>} />
          <Route path="/owner/theatres" element={<RoleRoute roles={['theatre_owner', 'admin']}><AdminTheatresPage /></RoleRoute>} />
          <Route path="/owner/screens" element={<RoleRoute roles={['theatre_owner', 'admin']}><AdminTheatresPage /></RoleRoute>} />
          <Route path="/owner/shows" element={<RoleRoute roles={['theatre_owner', 'admin']}><AdminShowsPage /></RoleRoute>} />
          <Route path="/owner/bookings" element={<RoleRoute roles={['theatre_owner', 'admin']}><AdminBookingsPage /></RoleRoute>} />
          <Route path="/owner/reports" element={<RoleRoute roles={['theatre_owner', 'admin']}><OwnerDashboard /></RoleRoute>} />
          <Route path="/owner/users" element={<RoleRoute roles={['theatre_owner']}><AdminUsersPage /></RoleRoute>} />

          {/* Staff routes */}
          <Route path="/staff" element={<RoleRoute roles={['staff', 'admin']}><StaffDashboard /></RoleRoute>} />
          <Route path="/staff/verify-ticket" element={<RoleRoute roles={['staff', 'admin']}><StaffVerificationPage /></RoleRoute>} />
          <Route path="/staff/food-orders" element={<RoleRoute roles={['staff', 'admin']}><StaffFoodOrdersPage /></RoleRoute>} />
        </Route>
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
