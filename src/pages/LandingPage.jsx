import React from 'react';
import { Container, Typography, Button, Box, CircularProgress, Avatar } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
// import axios from 'axios';

export default function LandingPage() {
  const { agencyCode } = useParams();
  const [agency, setAgency] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    // Mocked data for ABC
    if (agencyCode === 'abc') {
      setTimeout(() => {
        setAgency({
          name: 'ABC Recruitment',
          logo_url: 'https://via.placeholder.com/80x80.png?text=ABC',
          instructions: 'Welcome to ABC Recruitment! Please read the instructions carefully before proceeding. Make sure you have all your documents ready.'
        });
        setLoading(false);
      }, 500);
    } else {
      setError('Could not load agency details.');
      setLoading(false);
    }
    // Uncomment for real API:
    // async function fetchAgency() {
    //   setLoading(true);
    //   setError(null);
    //   try {
    //     const res = await axios.get(`/api/agencies/${agencyCode}/`);
    //     setAgency(res.data);
    //   } catch (err) {
    //     setError('Could not load agency details.');
    //   } finally {
    //     setLoading(false);
    //   }
    // }
    // fetchAgency();
  }, [agencyCode]);

  const handleProceed = () => {
    navigate(`/apply/${agencyCode}/form`);
  };

  if (loading) return <Box sx={{ mt: 8, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ mt: 8, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>;

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Box sx={{ p: 4, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {agency?.logo_url && (
          <Avatar src={agency.logo_url} alt={agency.name} sx={{ width: 80, height: 80, mb: 2 }} />
        )}
        <Typography variant="h3" gutterBottom>
          {agency?.name || 'Job Application Portal'}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          {agency?.instructions || 'Please read the instructions carefully before proceeding to the application.'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleProceed}
        >
          Proceed to Application
        </Button>
      </Box>
    </Container>
  );
} 