import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorBoundary, { DefaultErrorFallback } from './components/common/ErrorBoundary';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import SecurityUsage from './pages/SecurityUsage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '/security',
        element: <SecurityUsage />,
      },
    ],
  },
]);

function App() {
  return (
    <ErrorBoundary fallback={<DefaultErrorFallback error={new Error("Application error")} resetErrorBoundary={() => {}} />}>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App; 