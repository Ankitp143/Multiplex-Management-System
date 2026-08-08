import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import { AdminSidebar, OwnerSidebar, StaffSidebar } from '../common/Sidebar';
import { useAuth } from '../../context/AuthContext.jsx';

const Layout = () => {
  const { user } = useAuth();
  const role = user?.role;
  let SidebarComponent = null;
  if (role === 'admin') SidebarComponent = AdminSidebar;
  else if (role === 'owner' || role === 'theatre_owner') SidebarComponent = OwnerSidebar;
  else if (role === 'staff') SidebarComponent = StaffSidebar;

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      {SidebarComponent && <SidebarComponent />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ padding: '1rem', flexGrow: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
