import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import axios from 'axios';

const STATUS_COLORS = {
  pending: 'warning',
  reviewing: 'info',
  shortlisted: 'success',
  rejected: 'error',
  hired: 'success',
};

export default function ApplicationDetailsPage() {
  const { applicationId } = useParams();
  const [application, setApplication] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function fetchApplication() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/applications/${applicationId}/`);
        setApplication(res.data);
      } catch (err) {
        setError('Could not load application details.');
      } finally {
        setLoading(false);
      }
    }
    fetchApplication();
  }, [applicationId]);

  if (loading) return <Box sx={{ mt: 8, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ mt: 8, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>;
  if (!application) return null;

  return (
    <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Application Details
          </Typography>
          <Chip
            label={application.status.toUpperCase()}
            color={STATUS_COLORS[application.status]}
            variant="outlined"
          />
        </Box>

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText
                  primary="Full Name"
                  secondary={`${application.first_name} ${application.last_name}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><EmailIcon /></ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={application.email}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><PhoneIcon /></ListItemIcon>
                <ListItemText
                  primary="Phone"
                  secondary={application.phone}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><WorkIcon /></ListItemIcon>
                <ListItemText
                  primary="Job Post"
                  secondary={application.job_post_details?.title}
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Form Data */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Form Data
            </Typography>
            <List>
              {Object.entries(application.form_data).map(([key, value]) => (
                <ListItem key={key}>
                  <ListItemIcon><DescriptionIcon /></ListItemIcon>
                  <ListItemText
                    primary={key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    secondary={value}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Documents */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Documents
            </Typography>
            <List>
              {application.documents?.map((doc) => (
                <ListItem key={doc.id}>
                  <ListItemIcon><AttachFileIcon /></ListItemIcon>
                  <ListItemText
                    primary={doc.document_type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    secondary={
                      <a href={doc.file} target="_blank" rel="noopener noreferrer">
                        View Document
                      </a>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Metadata */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Additional Information
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><AccessTimeIcon /></ListItemIcon>
                <ListItemText
                  primary="Applied On"
                  secondary={new Date(application.created_at).toLocaleString()}
                />
              </ListItem>
              {application.notes && (
                <ListItem>
                  <ListItemIcon><DescriptionIcon /></ListItemIcon>
                  <ListItemText
                    primary="Notes"
                    secondary={application.notes}
                  />
                </ListItem>
              )}
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export function ThankYouPage() {
  const { agencyCode, applicationId } = useParams();
  const location = useLocation();
  const fullName = location.state?.full_name;
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Thank you for your application!
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Your application has been received.<br/>
          <strong>Agency Code:</strong> {agencyCode}<br/>
          <strong>Application ID:</strong> {applicationId}<br/>
          {fullName && <><strong>Full Name:</strong> {fullName}</>}
        </Typography>
      </Paper>
    </Container>
  );
} 