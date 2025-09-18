import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../shared/auth';
import Sidebar from '../admin/Sidebar.jsx';
import BlockList from '../admin/BlockList.jsx';
import AdminBlogs from '../admin/AdminBlogs.jsx';
import AdminCategories from '../admin/AdminCategories.jsx';
import AdminFooter from '../admin/AdminFooter.jsx';
import AdminHero from '../admin/AdminHero.jsx';
import AdminServices from '../admin/AdminServices.jsx';
import AdminPartners from '../admin/AdminPartners.jsx';
import AdminBanners from '../admin/AdminBanners.jsx';
import AdminProduct from '../admin/AdminProduct.jsx';
import AdminOrders from '../admin/AdminOrders.jsx'; 

const TYPES = [
  'Orders', 'Banner', 'Blog', 'Category', 'Footer', 'Hero', 'Partners', 'Products', 'Services'
];

export default function AdminDashboard() {
  const [active, setActive] = React.useState(TYPES[0]);
  const nav = useNavigate();

  function handleLogout() {
    auth.logout();
    nav("/", { replace: true });
  }

  if (!auth.isAuthed()) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Admin</h2>
        <p>You must be logged in as admin to view this page.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 'calc(100vh - 80px)' }}>
      <Sidebar items={TYPES} active={active} onSelect={setActive} />

      <div style={{ padding: 20 }}>
        {/* Top bar with logout */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#f42c37',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Logout
          </button>
        </div>

        {/* Content */}
        { active === 'Orders' ? (
          <AdminOrders />                          
        ) : active === 'Banner' ? (
          <AdminBanners />
        ) :  active === 'Blog' ? (
          <AdminBlogs />
        ) : active === 'Category' ? (
          <AdminCategories />
        ) : active === 'Footer' ? (
          <AdminFooter />
        ) : active === 'Hero' ? (
          <AdminHero />
        ) : active === 'Services' ? (
          <AdminServices />
        ) : active === 'Partners' ? (
          <AdminPartners />
        ) : active === 'Products' ? (
          <AdminProduct />
        ) : (
          <BlockList type={active} />
        )}
      </div>
    </div>
  );
}
