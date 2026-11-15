import { useEffect, useState } from 'react';
import { CafeProvider } from './store';
import { CustomerMenu } from './components/CustomerMenu';
import { AdminDashboard } from './components/AdminDashboard';

function isAdminPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '');
  return normalized === '/admin';
}

export default function App() {
  const [route, setRoute] = useState<'customer' | 'admin'>(() =>
    isAdminPath(window.location.pathname) ? 'admin' : 'customer'
  );

  useEffect(() => {
    const onPopState = () => {
      setRoute(isAdminPath(window.location.pathname) ? 'admin' : 'customer');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (target: 'customer' | 'admin') => {
    const nextPath = target === 'admin' ? '/admin' : '/';
    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }
    setRoute(target);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <CafeProvider>
      {route === 'admin' ? (
        <AdminDashboard onNavigateCustomer={() => navigate('customer')} />
      ) : (
        <CustomerMenu onNavigateAdmin={() => navigate('admin')} />
      )}
    </CafeProvider>
  );
}
