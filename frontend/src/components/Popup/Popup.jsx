import React from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import Button from '../Shared/Button';

const Popup = ({ orderPopup, handleOrderPopup, onAuthSuccess }) => {
  const [section, setSection] = React.useState('order'); // 'order' | 'auth'
  const [authMode, setAuthMode] = React.useState('login'); // 'login' | 'signup'

  // Order form (unchanged)
  const [order, setOrder] = React.useState({ name: '', email: '', address: '' });

  // Auth form
  const [auth, setAuth] = React.useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Reset when closed
  React.useEffect(() => {
    if (!orderPopup) {
      setSection('order');
      setAuthMode('login');
      setAuth({ name: '', email: '', password: '' });
      setError('');
      setLoading(false);
    }
  }, [orderPopup]);

  // Prefer Vite base if present, otherwise same-origin
  const API_BASE = (import.meta?.env?.VITE_API_BASE || '').replace(/\/$/, '');

  function storeAuth(payload) {
    try {
      // If you have a shared auth helper, use it; else fall back to localStorage.
      if (window?.auth?.loginSuccess) {
        window.auth.loginSuccess(payload);
      } else {
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(payload.user));
      }
      onAuthSuccess?.(payload);
    } catch (_) {}
  }

  async function submitAuth(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const path = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const body =
        authMode === 'signup'
          ? { name: auth.name.trim(), email: String(auth.email).toLowerCase().trim(), password: auth.password }
          : { email: String(auth.email).toLowerCase().trim(), password: auth.password };

      const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error?.message || data?.error || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      // Save auth + prefill order name/email
      storeAuth(data);
      setOrder((prev) => ({
        ...prev,
        name: data?.user?.name ?? prev.name,
        email: data?.user?.email ?? prev.email,
      }));

      // Return to order section after success
      setSection('order');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {orderPopup && (
        <div className="h-screen w-screen fixed top-0 left-0 bg-black/50 z-50 backdrop-blur-sm">
          <div
            className="w-[300px] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
             p-4 shadow-md bg-white dark:bg-gray-900 dark:text-white duration-200 rounded-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="font-semibold">
                {section === 'order' ? 'Order Now' : authMode === 'signup' ? 'Create an account' : 'Log in'}
              </h1>
              <button onClick={handleOrderPopup} aria-label="Close">
                <IoCloseOutline className="text-2xl cursor-pointer" />
              </button>
            </div>

            {/* Section switch */}
            <div className="flex gap-2 text-sm mt-3">
              <button
                className={`px-3 py-1 rounded-full ${
                  section === 'order' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/10'
                }`}
                onClick={() => setSection('order')}
              >
                Order
              </button>
              <button
                className={`px-3 py-1 rounded-full ${
                  section === 'auth' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/10'
                }`}
                onClick={() => setSection('auth')}
              >
                Account
              </button>
            </div>

            {/* Content */}
            <div className="mt-4">
              {section === 'order' ? (
                // -------- ORDER FORM (unchanged layout) --------
                <>
                  <input
                    type="text"
                    placeholder="Name"
                    className="form-input"
                    value={order.name}
                    onChange={(e) => setOrder({ ...order, name: e.target.value })}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="form-input"
                    value={order.email}
                    onChange={(e) => setOrder({ ...order, email: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    className="form-input"
                    value={order.address}
                    onChange={(e) => setOrder({ ...order, address: e.target.value })}
                  />
                  <div className="flex justify-center">
                    <Button text="Order Now" bgColor={'bg-primary'} textColor={'text-white'} />
                  </div>

                  <p className="text-xs opacity-80 mt-3 text-center">
                    Have an account?{' '}
                    <button
                      className="underline"
                      onClick={() => {
                        setSection('auth');
                        setAuthMode('login');
                      }}
                    >
                      Log in
                    </button>{' '}
                    or{' '}
                    <button
                      className="underline"
                      onClick={() => {
                        setSection('auth');
                        setAuthMode('signup');
                      }}
                    >
                      Sign up
                    </button>
                    .
                  </p>
                </>
              ) : (
                // -------- AUTH FORM (login / signup) --------
                <form onSubmit={submitAuth} className="space-y-3">
                  {/* Auth mode switch */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`px-3 py-1 rounded-full ${
                        authMode === 'signup' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/10'
                      }`}
                      onClick={() => setAuthMode('signup')}
                    >
                      Sign up
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1 rounded-full ${
                        authMode === 'login' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/10'
                      }`}
                      onClick={() => setAuthMode('login')}
                    >
                      Log in
                    </button>
                  </div>

                  {authMode === 'signup' && (
                    <input
                      type="text"
                      className="form-input w-full"
                      placeholder="Full name"
                      value={auth.name}
                      onChange={(e) => setAuth({ ...auth, name: e.target.value })}
                      required
                    />
                  )}
                  <input
                    type="email"
                    className="form-input w-full"
                    placeholder="Email address"
                    value={auth.email}
                    onChange={(e) => setAuth({ ...auth, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                  <input
                    type="password"
                    className="form-input w-full"
                    placeholder="Password"
                    value={auth.password}
                    onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                    required
                    minLength={6}
                    autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  />

                  {error && <p className="text-red-600 text-sm">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 rounded-lg bg-primary text-white disabled:opacity-60"
                  >
                    {loading ? 'Please wait...' : authMode === 'signup' ? 'Create account' : 'Log in'}
                  </button>

                  <p className="text-xs opacity-80">
                    {authMode === 'signup' ? (
                      <>
                        Already have an account?{' '}
                        <button type="button" className="underline" onClick={() => setAuthMode('login')}>
                          Log in
                        </button>
                        .
                      </>
                    ) : (
                      <>
                        New here?{' '}
                        <button type="button" className="underline" onClick={() => setAuthMode('signup')}>
                          Create an account
                        </button>
                        .
                      </>
                    )}
                  </p>

                  <p className="text-xs opacity-70">
                    <button type="button" className="underline" onClick={() => setSection('order')}>
                      ← Back to order
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
