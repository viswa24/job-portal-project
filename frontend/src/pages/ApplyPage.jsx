import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, CircularProgress, Box } from '@mui/material';
// import DynamicForm from '../components/DynamicForm'; // To be implemented
import axios from 'axios';

export default function ApplyPage() {
  const { agencyCode } = useParams();
  const [formSchema, setFormSchema] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function fetchSchema() {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual job post ID or selection logic
        const jobPostId = 1;
        const res = await axios.get(`/api/job-posts/${jobPostId}/form_schema/`);
        setFormSchema(res.data);
      } catch (err) {
        setError('Could not load form schema.');
      } finally {
        setLoading(false);
      }
    }
    fetchSchema();
  }, [agencyCode]);

  if (loading) return <Box sx={{ mt: 8, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ mt: 8, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>;

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Application Form for Agency: {agencyCode}
      </Typography>
      {/* <DynamicForm schema={formSchema} /> */}
      <Typography variant="body2" color="text.secondary">(Dynamic form will render here.)</Typography>
    </Container>
  );
} 