import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppRoute } from '../types/index.ts';

interface RouterContextValue {
  currentPath: string;
  routeParams: Record<string, string>;
  navigate: (path: string) => void;
  goBack: () => void;
}

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    // Read from window.location.pathname or fallback to '/'
    const path = window.location.pathname || '/';
    return path;
  });

  const [routeParams, setRouteParams] = useState<Record<string, string>>({});

  const navigate = (to: string) => {
    // Parse any dynamic parameters
    if (to.startsWith('/product/')) {
      const slug = to.replace('/product/', '');
      setRouteParams({ slug });
    } else if (to.startsWith('/payment/')) {
      const orderId = to.replace('/payment/', '');
      setRouteParams({ orderId });
    } else if (to.startsWith('/orders/')) {
      const orderId = to.replace('/orders/', '');
      setRouteParams({ id: orderId });
    } else {
      setRouteParams({});
    }

    setCurrentPath(to);
    window.history.pushState({}, '', to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{ currentPath, routeParams, navigate, goBack }}>
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter(): RouterContextValue {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}
