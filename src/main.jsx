import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx'; 


import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import AdminServicesPage from './pages/admin/AdminServicesPage.jsx';
import BusinessServicesPage from './pages/ServicesListPage.jsx';
import AdminAvailabilityPage from './pages/admin/AdminAvailabilityPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage.jsx';
import MyAppointmentsPage from './pages/MyAppointmentsPage.jsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "admin/services", element: <AdminServicesPage /> },
      { path: "empresa/:businessSlug/servicos", element: <BusinessServicesPage />},
      { path: "admin/availability", element: <AdminAvailabilityPage /> },
      { path: "agendar/empresa/:businessSlug/servico/:serviceId", element: <BookingPage /> },
      { path: "admin/appointments", element: <AdminAppointmentsPage /> },
      { path: "meus-agendamentos", element: <MyAppointmentsPage /> }

    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> 
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);