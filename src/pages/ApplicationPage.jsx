import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress, Card, CardContent } from '@mui/material';
// import axios from 'axios';
import DynamicForm from '../components/DynamicForm/DynamicForm';

const MOCK_JOB_POSTS = [
  { id: 1, title: 'Software Engineer', description: 'Apply for the Software Engineer position at ABC.' },
  { id: 2, title: 'Data Analyst', description: 'Apply for the Data Analyst position at ABC.' }
];

const MOCK_FORM_SCHEMA = {
  fields: [
    { name: 'first_name', type: 'text', label: 'First Name', required: true },
    { name: 'last_name', type: 'text', label: 'Last Name', required: true },
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'phone', type: 'text', label: 'Phone', required: true },
    { name: 'resume', type: 'file', label: 'Resume (PDF)', required: true, accept: ['.pdf'] }
  ]
};

export default function ApplicationPage() {
  const { agencyCode } = useParams();
  const [jobPosts, setJobPosts] = React.useState([]);
  const [selectedJobPost, setSelectedJobPost] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [formSchema, setFormSchema] = React.useState(null);
  const [showForm, setShowForm] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    // Mocked data for ABC
    if (agencyCode === 'abc') {
      setTimeout(() => {
        setJobPosts(MOCK_JOB_POSTS);
        setLoading(false);
      }, 500);
    } else {
      setError('Could not fetch job posts.');
      setLoading(false);
    }
    // Uncomment for real API:
    // async function fetchJobPosts() {
    //   setLoading(true);
    //   setError(null);
    //   try {
    //     const res = await axios.get(`/api/agencies/${agencyCode}/job_posts/`);
    //     setJobPosts(res.data);
    //     if (res.data.length === 0) {
    //       setError('No job posts found for this agency.');
    //     }
    //   } catch (err) {
    //     setError('Could not fetch job posts.');
    //   } finally {
    //     setLoading(false);
    //   }
    // }
    // fetchJobPosts();
  }, [agencyCode]);

  const handleStart = async () => {
    setShowForm(false);
    setFormSchema(null);
    // Mocked schema for demo
    setTimeout(() => {
      setFormSchema(MOCK_FORM_SCHEMA);
      setShowForm(true);
    }, 400);
    // Uncomment for real API:
    // try {
    //   const res = await axios.get(`/api/job-posts/${selectedJobPost}/form_schema/`);
    //   setFormSchema(res.data);
    //   setShowForm(true);
    // } catch (err) {
    //   setError('Could not load form schema.');
    // }
  };

  if (loading) return <Box sx={{ mt: 8, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ mt: 8, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>;

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Box sx={{ p: 4, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h4" gutterBottom>
          Select Job Post
        </Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="job-post-label">Job Post</InputLabel>
          <Select
            labelId="job-post-label"
            value={selectedJobPost}
            label="Job Post"
            onChange={e => setSelectedJobPost(e.target.value)}
          >
            {jobPosts.map(post => (
              <MenuItem key={post.id} value={post.id}>
                <Card variant="outlined" sx={{ mb: 1 }}>
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="subtitle1">{post.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{post.description}</Typography>
                  </CardContent>
                </Card>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleStart}
          disabled={!selectedJobPost}
        >
          Start Application
        </Button>
        {showForm && formSchema && (
          <Box sx={{ mt: 4 }}>
            <DynamicForm schema={formSchema} />
          </Box>
        )}
      </Box>
    </Container>
  );
} 