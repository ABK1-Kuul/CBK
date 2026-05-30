import React from 'react';
import { MockStateProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

export default function App() {
  return (
    <MockStateProvider>
      <AppLayout />
    </MockStateProvider>
  );
}
