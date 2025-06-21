import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import LandingPage from './pages/LandingPage';
import ApplicationPage from './pages/ApplicationPage';
import ApplicationDetailsPage from './pages/ApplicationDetailsPage';
import SuccessPage from './pages/SuccessPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/apply/ABC" replace />} />
          <Route path="/apply/:agencyCode" element={<LandingPage />} />
          <Route path="/apply/:agencyCode/form" element={<ApplicationPage />} />
          <Route path="/applications/:applicationId" element={<ApplicationDetailsPage />} />
          <Route path="/success/:applicationId" element={<SuccessPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
