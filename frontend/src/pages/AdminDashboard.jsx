import React from 'react';
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


const TYPES = [
  'Banner', 'Blog', 'Category', 'Footer', 'Hero', 'Partners', 'Products', 'Services'
];

export default function AdminDashboard() {
  const [active, setActive] = React.useState(TYPES[0]);

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
        { active === "Banner" ? (
          <AdminBanners />
        ) :  active === 'Blog' ? (
          <AdminBlogs />
        ) : active === 'Category' ? (
          <AdminCategories />
        ) : active === 'Footer' ? (
          <AdminFooter /> 
        ) : active === "Hero" ? (
          <AdminHero />
        ) : active === "Services" ? (
          <AdminServices /> 
        ) : active === "Partners" ? (
          <AdminPartners /> 
        ) : active === "Products" ? (
          <AdminProduct />
        ) : (
          <BlockList type={active} />
        )}

      </div>
    </div>
  );
}