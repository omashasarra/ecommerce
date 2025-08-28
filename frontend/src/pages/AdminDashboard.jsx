import { useState } from 'react';
import Login from '../components/Login';
import ProductsList from '../components/ProductsList';
import AddProductForm from '../components/AddProductForm';
import { auth } from "../Shared/auth.js";

function AdminDashboard(){
  const [, bump] = useState(0);
  const isAuthed = auth.isAuthed();

  function onLogin(){ bump(x=>x+1); }
  function onAdded(){ bump(x=>x+1); }

  function logout(){ auth.token = null; bump(x=>x+1); }

  return (
    <div style={{ padding: 16 }}>
      <h1>Admin</h1>
      <div style={{ marginBottom: 12 }}>
        {isAuthed ? <button onClick={logout}>Logout</button> : <span>Login as admin to manage products</span>}
      </div>

      {!isAuthed && <Login onLogin={onLogin} />}
      {isAuthed && <AddProductForm onAdded={onAdded} />}
      <ProductsList />
    </div>
  );
}
export default AdminDashboard;