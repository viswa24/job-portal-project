import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import DynamicForm from '../components/DynamicForm/DynamicForm';

export default function ApplicationPage() {
  const { agencyCode } = useParams();
  const [jobPosts, setJobPosts] = React.useState([]);
  const [selectedJobPost, setSelectedJobPost] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [formSchema, setFormSchema] = React.useState(null);

  // Fetch agency details (for default schema) and job posts on mount
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch agency details for the default form schema
        const agencyRes = await axios.get(`/api/agencies/${agencyCode}/`);
        if (agencyRes.data.default_form_schema) {
          setFormSchema(agencyRes.data.default_form_schema);
        }

        // Fetch job posts
        const jobsRes = await axios.get(`/api/agencies/${agencyCode}/job_posts/`);
        setJobPosts(jobsRes.data);

        // If there's only one job post, select it by default
        if (jobsRes.data.length === 1) {
          setSelectedJobPost(jobsRes.data[0].id);
        } else if (jobsRes.data.length === 0) {
          setError('No job posts found for this agency.');
        }
      } catch (err) {
        setError('Could not fetch initial data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [agencyCode]);

  // Fetch full form schema when a job is selected
  React.useEffect(() => {
    if (!selectedJobPost) {
      // If deselected, we might want to revert to the default schema.
      // For now, we do nothing and keep the last selected schema.
      return;
    }
    async function fetchJobSchema() {
      try {
        const res = await axios.get(`/api/job-posts/${selectedJobPost}/form_schema/`);
        setFormSchema(res.data);
      } catch (err) {
        setError('Could not load the form schema.');
        setFormSchema(null);
      }
    }
    fetchJobSchema();
  }, [selectedJobPost]);

  const handleJobChange = (e) => {
    const newJobId = e.target.value;
    setSelectedJobPost(newJobId);
  };

  if (loading) return <Box sx={{ mt: 8, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ mt: 8, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>;

  return (
    <Container maxWidth="xl" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Application Form
      </Typography>
      <Box sx={{ mt: 4 }}>
        {formSchema ? (
          <DynamicForm 
            schema={formSchema} 
            jobPostId={selectedJobPost} 
            jobPosts={jobPosts}
            selectedJobPost={selectedJobPost}
            onJobChange={handleJobChange}
          />
        ) : (
          !error && <Box sx={{ textAlign: 'center' }}><CircularProgress /></Box>
        )}
      </Box>
    </Container>
  );
} 