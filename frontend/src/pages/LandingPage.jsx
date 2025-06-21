import React from 'react';
import { Container, Typography, Button, Box, CircularProgress, Avatar } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function LandingPage() {
  const { agencyCode } = useParams();
  const [agency, setAgency] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    async function fetchAgency() {
      setLoading(true);
      setError(null);
      try {
        // Placeholder: Replace with actual API call
        const res = await axios.get(`/api/agencies/${agencyCode}/`);
        setAgency(res.data);
      } catch (err) {
        setError('Could not load agency details.');
      } finally {
        setLoading(false);
      }
    }
    fetchAgency();
  }, [agencyCode]);

  const handleProceed = () => {
    navigate(`/apply/${agencyCode}/form`);
  };

  if (loading) return <Box sx={{ mt: 8, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ mt: 8, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>;

  return (
    <Container maxWidth="xl" sx={{ mt: 8, textAlign: 'center' }}>
      <Box sx={{ p: 4, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {agency?.logo_url && (
          <Avatar src={agency.logo_url} alt={agency.name} sx={{ width: 80, height: 80, mb: 2 }} />
        )}
        <Typography
          variant="body1"
          sx={{ mb: 3, color: 'text.secondary', textAlign: 'left', width: '100%' }}
          dangerouslySetInnerHTML={{ __html: agency?.instructions || 'Please read the instructions carefully before proceeding to the application.' }}
        />
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