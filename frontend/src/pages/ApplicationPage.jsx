import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import { Formik } from 'formik';
import DynamicForm, { buildValidationSchema } from '../components/DynamicForm/DynamicForm';

export default function ApplicationPage() {
  const { agencyCode } = useParams();
  const navigate = useNavigate();
  const [jobPosts, setJobPosts] = React.useState([]);
  const [selectedJobPost, setSelectedJobPost] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [formSchema, setFormSchema] = React.useState(null);
  const [initialValues, setInitialValues] = React.useState({});

  const formikRef = React.useRef();

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const agencyRes = await axios.get(`/api/agencies/${agencyCode}/`);
        const schema = agencyRes.data.default_form_schema;
        if (schema) {
          setFormSchema(schema);
          setInitialValues(generateInitialValues(schema));
        }

        const jobsRes = await axios.get(`/api/agencies/${agencyCode}/job_posts/`);
        setJobPosts(jobsRes.data);

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

  React.useEffect(() => {
    if (!selectedJobPost) return;

    async function fetchJobSchema() {
      try {
        const res = await axios.get(`/api/job-posts/${selectedJobPost}/form_schema/`);
        const newSchema = res.data;
        setFormSchema(newSchema);
        
        // Preserve existing values when schema changes
        if (formikRef.current) {
          const currentValues = formikRef.current.values;
          const newInitialValues = generateInitialValues(newSchema);
          const mergedValues = { ...newInitialValues, ...currentValues };
          formikRef.current.setValues(mergedValues);
        }
        
      } catch (err) {
        setError('Could not load the form schema.');
        setFormSchema(null);
      }
    }
    fetchJobSchema();
  }, [selectedJobPost]);

  const handleJobChange = (e) => {
    setSelectedJobPost(e.target.value);
  };

  const generateInitialValues = (schema) => {
    const values = {};
    if (schema && Array.isArray(schema.fields)) {
      schema.fields.forEach(field => {
        if (field.type === 'array') {
          values[field.name] = [field.fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})];
        } else if (field.type === 'group') {
          values[field.name] = {};
          if (Array.isArray(field.fields)) {
            field.fields.forEach(subField => {
              values[field.name][subField.name] = '';
            });
          }
        } else {
          values[field.name] = '';
        }
      });
    }
    return values;
  };
  
  const validationSchema = React.useMemo(() => {
    if (formSchema && Array.isArray(formSchema.fields)) {
      return buildValidationSchema(formSchema.fields);
    }
    return null;
  }, [formSchema]);


  if (loading) return <Box sx={{ mt: 8, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ mt: 8, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>;

  return (
    <Container maxWidth="xl" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Application Form
      </Typography>
      <Box sx={{ mt: 4 }}>
        {formSchema && validationSchema ? (
          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              const formData = new FormData();
              formData.append('job_post', selectedJobPost);
      
              const form_data = {};
      
              for (const [key, value] of Object.entries(values)) {
                const field = formSchema.fields.find(f => f.name === key);
                if (value instanceof File) {
                  formData.append(key, value);
                } else if (field && field.type === 'array' && Array.isArray(value)) {
                  const fileFields = field.fields.filter(f => f.type === 'file').map(f => f.name);
                  const processedArray = value.map((item, index) => {
                    const newItem = { ...item };
                    for (const fileField of fileFields) {
                      if (item[fileField] instanceof File) {
                        const fileKey = `${key}_${index}_${fileField}`;
                        formData.append(fileKey, item[fileField]);
                        newItem[fileField] = fileKey; 
                      }
                    }
                    return newItem;
                  });
                  form_data[key] = processedArray;
                } else if (field && field.type === 'signature') {
                  form_data[key] = value;
                } else {
                  form_data[key] = value;
                }
              }
      
              formData.append('form_data', JSON.stringify(form_data));
      
              if(form_data.full_name) formData.append('full_name', form_data.full_name);
              if(form_data.email) formData.append('email', form_data.email);
              if(form_data.phone) formData.append('phone', form_data.phone);
      
              try {
                const response = await fetch('/api/applications/', { method: 'POST', body: formData });
                if (!response.ok) {
                  const errorData = await response.json();
                  console.error('Submission failed:', errorData);
                  throw new Error('Network response was not ok');
                }
                const result = await response.json();
                navigate(`/success/${result.id}`);
              } catch (error) {
                console.error('Submission failed:', error);
              }
              setSubmitting(false);
            }}
            enableReinitialize
          >
            {formik => (
              <DynamicForm 
                schema={formSchema} 
                formik={formik}
                jobPosts={jobPosts}
                selectedJobPost={selectedJobPost}
                onJobChange={handleJobChange}
              />
            )}
          </Formik>
        ) : (
          !error && <Box sx={{ textAlign: 'center' }}><CircularProgress /></Box>
        )}
      </Box>
    </Container>
  );
} 