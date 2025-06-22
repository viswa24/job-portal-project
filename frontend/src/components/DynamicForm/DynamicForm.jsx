import React, { useRef } from 'react';
import { Box, Button, TextField, Typography, Stack, Grid, Paper, IconButton, Checkbox, FormControlLabel, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { FieldArray, Field, getIn } from 'formik';
import * as Yup from 'yup';
import { Delete } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SignatureCanvas from 'react-signature-canvas';

export function buildValidationSchema(fields) {
  const schema = {};
  fields.forEach(field => {
    let validator;
    if (field.type === 'email') {
      validator = Yup.string().email('Invalid email address');
    } else if (field.name === 'phone') {
      validator = Yup.string()
        .matches(/^[0-9]{10,}$/, 'Phone number must be at least 10 digits');
    } else if (field.type === 'file') {
      validator = Yup.mixed();
    } else if (field.type === 'group') {
      const groupSchema = {};
      if (Array.isArray(field.fields)) {
        field.fields.forEach(subField => {
          let subValidator;
          if (subField.type === 'number') {
            subValidator = Yup.number().typeError(`${subField.label} must be a number`);
          } else {
            subValidator = Yup.string();
          }
          if (subField.required) {
            subValidator = subValidator.required(`${subField.label} is required`);
          }
          groupSchema[subField.name] = subValidator;
        });
      }
      validator = Yup.object().shape(groupSchema);

      if (field.name === 'communication_address') {
        validator = validator.when('same_as_permanent', {
          is: false,
          then: (s) => s.shape({
            address_line_1: Yup.string().required('Address Line 1 is required'),
            city: Yup.string().required('City is required'),
            district: Yup.string().required('District is required'),
            state: Yup.string().required('State is required'),
            pincode: Yup.number().typeError('Pincode must be a number').required('Pincode is required'),
          }),
          otherwise: (s) => s.notRequired(),
        });
      }
    } else if (field.type === 'array') {
      const subSchema = {};
      if (Array.isArray(field.fields)) {
        field.fields.forEach(subField => {
          let subValidator = Yup.string();
          if (subField.required) {
            subValidator = subValidator.required('This field is required');
          }
          subSchema[subField.name] = subValidator;
        });
      }
      schema[field.name] = Yup.array()
        .of(Yup.object().shape(subSchema))
        .min(field.min_items || 0, `At least ${field.min_items} item(s) required`);
      return;
    } else {
      validator = Yup.string();
    }

    if (field.required) {
      if (field.type === 'checkbox') {
        validator = Yup.boolean().oneOf([true], 'This field must be checked');
      } else {
        validator = validator.required('This field is required');
      }
    }

    schema[field.name] = validator;
  });
  return Yup.object().shape(schema);
}

const SignatureCanvasField = ({ field, formik }) => {
  const sigCanvas = useRef({});
  const { setFieldValue } = formik;
  return (
    <Box>
      <Typography variant="h6" gutterBottom>{field.label}</Typography>
      <Paper variant="outlined">
        <SignatureCanvas
          ref={sigCanvas}
          penColor='black'
          canvasProps={{ style: { width: '100%', height: 200 } }}
          onEnd={() => setFieldValue(field.name, sigCanvas.current.toDataURL())}
        />
      </Paper>
      <Button onClick={() => sigCanvas.current.clear()}>Clear</Button>
    </Box>
  );
};

const DynamicForm = ({ schema, formik, jobPostId, jobPosts, selectedJobPost, onJobChange }) => {
  const calculateAge = (birthDate, asOnDate) => {
    if (!birthDate) return '';
    const birth = new Date(birthDate);
    const asOn = asOnDate ? new Date(asOnDate) : new Date();
    
    let years = asOn.getFullYear() - birth.getFullYear();
    let months = asOn.getMonth() - birth.getMonth();
    let days = asOn.getDate() - birth.getDate();
    
    // Adjust for negative months or days
    if (days < 0) {
      months--;
      const lastMonth = new Date(asOn.getFullYear(), asOn.getMonth(), 0);
      days += lastMonth.getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    // Build the age string
    let ageString = '';
    if (years > 0) {
      ageString = `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}, ${days} day${days !== 1 ? 's' : ''}`;
    } else if (months > 0) {
      ageString = `${months} month${months !== 1 ? 's' : ''}, ${days} day${days !== 1 ? 's' : ''}`;
    } else {
      ageString = `${days} day${days !== 1 ? 's' : ''}`;
    }
    
    return ageString;
  };

  const numberFieldStyles = {
    '& input[type=number]': {
      '-moz-appearance': 'textfield',
    },
    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
  };

  const renderField = (field, formik) => {
    const { values, setFieldValue, handleChange, errors, touched } = formik;

    if (field.type === 'array') {
      return (
        <Box key={field.name}>
          <Typography variant="h6" gutterBottom>{field.label || field.name}</Typography>
          <FieldArray
            name={field.name}
            render={arrayHelpers => {
              const arrValues = values[field.name] || [];
              return (
                <Box>
                  {arrValues.map((item, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        {field.fields.map(subfield => (
                          <Grid item xs={12} sm={field.fields.length > 2 ? 3 : 5} key={subfield.name}>
                            {(subfield.type === 'date' || subfield.type === 'month_year') ? (
                              <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                  label={subfield.label}
                                  value={item[subfield.name] ? new Date(item[subfield.name]) : null}
                                  onChange={newValue => {
                                    const formatted = newValue ? newValue.toISOString().split('T')[0] : '';
                                    const arr = [...arrValues];
                                    if (arr[idx]) {
                                      arr[idx][subfield.name] = formatted;
                                      setFieldValue(field.name, arr, true);
                                    }
                                  }}
                                  views={subfield.type === 'month_year' || subfield.format === 'month-year' ? ['year', 'month'] : ['year', 'month', 'day']}
                                  format={subfield.type === 'month_year' || subfield.format === 'month-year' ? 'MM/yyyy' : 'dd/MM/yyyy'}
                                  slotProps={{ textField: { fullWidth: true, required: subfield.required, error: !!(touched[field.name]?.[idx]?.[subfield.name] && errors[field.name]?.[idx]?.[subfield.name]), helperText: touched[field.name]?.[idx]?.[subfield.name] && errors[field.name]?.[idx]?.[subfield.name] } }}
                                />
                              </LocalizationProvider>
                            ) : subfield.type === 'file' ? (
                              <FormControl>
                                <input
                                  type="file"
                                  name={`${field.name}[${idx}].${subfield.name}`}
                                  onChange={(e) => {
                                    setFieldValue(`${field.name}[${idx}].${subfield.name}`, e.currentTarget.files[0]);
                                    formik.validateField(`${field.name}[${idx}].${subfield.name}`);
                                  }}
                                  required={subfield.required}
                                />
                                {getIn(touched, `${field.name}[${idx}].${subfield.name}`) && getIn(errors, `${field.name}[${idx}].${subfield.name}`) && 
                                  <Typography color="error" variant="caption">{getIn(errors, `${field.name}[${idx}].${subfield.name}`)}</Typography>
                                }
                              </FormControl>
                            ) : (
                              <Field
                                as={TextField}
                                name={`${field.name}[${idx}].${subfield.name}`}
                                label={subfield.label}
                                type={'text'}
                                fullWidth
                                required={subfield.required}
                                error={touched[field.name]?.[idx]?.[subfield.name] && !!errors[field.name]?.[idx]?.[subfield.name]}
                                helperText={touched[field.name]?.[idx]?.[subfield.name] && errors[field.name]?.[idx]?.[subfield.name]}
                                onChange={handleChange}
                                multiline={subfield.type === 'textarea'}
                                rows={subfield.type === 'textarea' ? 4 : 1}
                              />
                            )}
                          </Grid>
                        ))}
                        <Grid item xs={12} sm={1}>
                          <IconButton onClick={() => arrayHelpers.remove(idx)}><Delete /></IconButton>
                        </Grid>
                        {field.name === 'work_experience' && (
                            <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary">
                                    Experience: {calculateExperience(item.from_date, item.to_date)}
                                </Typography>
                            </Grid>
                        )}
                      </Grid>
                    </Paper>
                  ))}
                  <Button variant="outlined" onClick={() => arrayHelpers.push(field.fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {}))}>
                    Add {field.item_label || 'Item'}
                  </Button>
                  {field.name === 'work_experience' && (
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Total Experience: {calculateTotalExperience(values.work_experience)}
                    </Typography>
                  )}
                </Box>
              );
            }}
          />
        </Box>
      );
    }

    if (field.type === 'group') {
      return (
        <Paper key={field.name} variant="outlined" sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>{field.label}</Typography>
          <Stack spacing={2}>
            {field.fields.map(subField => {
              const subFieldName = `${field.name}.${subField.name}`;
              const subFieldTouched = getIn(formik.touched, subFieldName);
              const subFieldError = getIn(formik.errors, subFieldName);

              return (
                <Field
                  key={subField.name}
                  as={TextField}
                  name={subFieldName}
                  label={subField.label}
                  type={subField.type || 'text'}
                  fullWidth
                  required={subField.required}
                  error={subFieldTouched && !!subFieldError}
                  helperText={subFieldTouched && subFieldError}
                  disabled={field.name === 'communication_address' && values.same_as_permanent}
                  sx={subField.type === 'number' ? numberFieldStyles : undefined}
                />
              );
            })}
          </Stack>
        </Paper>
      );
    }

    if (field.type === 'date') {
      const isDateOfBirth = field.name.toLowerCase().includes('birth') || field.name.toLowerCase().includes('dob');
      const asOnDateForField = field.age_as_on || schema.as_on_date;
      const age = isDateOfBirth ? calculateAge(values[field.name], asOnDateForField) : '';
      
      return (
        <Box>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={isDateOfBirth ? 6 : 12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={field.label}
                  value={values[field.name] ? new Date(values[field.name]) : null}
                  onChange={newValue => {
                    const formatted = newValue ? newValue.toISOString().split('T')[0] : '';
                    formik.setFieldValue(field.name, formatted);
                  }}
                  views={field.format === 'month-year' ? ['year', 'month'] : ['year', 'month', 'day']}
                  format={field.format === 'month-year' ? 'MM/yyyy' : 'dd/MM/yyyy'}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      required: field.required, 
                      error: !!(formik.touched[field.name] && formik.errors[field.name]), 
                      helperText: formik.touched[field.name] && formik.errors[field.name] 
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
            {isDateOfBirth && age && (
              <Grid item xs={6}>
                <Typography variant="body1" color="primary" sx={{ mt: 2, fontWeight: 'bold' }}>
                  {asOnDateForField ? `Age as on ${new Date(asOnDateForField).toLocaleDateString('en-GB')}` : 'Age'}: {age}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      );
    }

    if (field.type === 'file') {
      return (
        <FormControl fullWidth required={field.required} error={formik.touched[field.name] && !!formik.errors[field.name]}>
          <Typography variant="body1" sx={{ mb: 1 }}>{field.label}</Typography>
          <input
            type="file"
            name={field.name}
            onChange={(e) => {
              formik.setFieldValue(field.name, e.currentTarget.files[0]);
              formik.validateField(field.name);
            }}
            required={field.required}
          />
          {formik.touched[field.name] && formik.errors[field.name] && <Typography color="error" variant="caption">{formik.errors[field.name]}</Typography>}
        </FormControl>
      );
    }

    if (field.type === 'signature') {
      return <SignatureCanvasField key={field.name} field={field} formik={formik} />;
    }

    if (field.type === 'checkbox') {
      return (
        <FormControlLabel
          control={
            <Checkbox
              name={field.name}
              checked={values[field.name] || false}
              onChange={(e) => {
                const isChecked = e.target.checked;
                formik.setFieldValue(field.name, isChecked);
                if (field.name === 'same_as_permanent') {
                  if (isChecked) {
                    formik.setFieldValue('communication_address', values.permanent_address);
                  } else {
                    const commAddressField = schema.fields.find(f => f.name === 'communication_address');
                    if (commAddressField && commAddressField.type === 'group') {
                      const emptyAddress = commAddressField.fields.reduce((acc, subField) => {
                        acc[subField.name] = '';
                        return acc;
                      }, {});
                      formik.setFieldValue('communication_address', emptyAddress);
                    }
                  }
                }
              }}
            />
          }
          label={field.label}
        />
      );
    }

    return (
      <Field
        as={TextField}
        name={field.name}
        label={field.label}
        type={field.type}
        fullWidth
        required={field.required}
        error={formik.touched[field.name] && !!formik.errors[field.name]}
        helperText={formik.touched[field.name] && formik.errors[field.name]}
        onChange={handleChange}
        multiline={field.type === 'textarea'}
        rows={field.type === 'textarea' ? 4 : 1}
        sx={field.type === 'number' ? numberFieldStyles : undefined}
      />
    );
  };

  const calculateExperience = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Please provide start and end dates.';

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Invalid date format.';

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
        months--;
        const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        days += lastMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    return `${years} years, ${months} months, ${days} days`;
  };

  const calculateTotalExperience = (experiences) => {
    if (!Array.isArray(experiences)) return '0 years, 0 months, 0 days';

    let totalYears = 0;
    let totalMonths = 0;
    let totalDays = 0;

    experiences.forEach(exp => {
        if (exp.from_date && exp.to_date) {
            const start = new Date(exp.from_date);
            const end = new Date(exp.to_date);

            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                let years = end.getFullYear() - start.getFullYear();
                let months = end.getMonth() - start.getMonth();
                let days = end.getDate() - start.getDate();

                if (days < 0) {
                    months--;
                    const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
                    days += lastMonth.getDate();
                }
                if (months < 0) {
                    years--;
                    months += 12;
                }
                totalYears += years;
                totalMonths += months;
                totalDays += days;
            }
        }
    });

    totalMonths += Math.floor(totalDays / 30);
    totalDays %= 30;
    totalYears += Math.floor(totalMonths / 12);
    totalMonths %= 12;

    return `${totalYears} years, ${totalMonths} months, ${totalDays} days`;
  };

  const { values, touched, errors, setFieldValue, handleChange, isSubmitting } = formik;

  const fields = schema.fields || [];
  const mainFields = fields.filter(f => f.name !== 'photo' && f.name !== 'signature' && f.name !== 'declaration');
  const photoField = fields.find(f => f.name === 'photo');
  const signatureField = fields.find(f => f.name === 'signature');
  const declarationField = fields.find(f => f.name === 'declaration');

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack spacing={3}>
        {mainFields.map(field => (
          <Box key={field.name}>
            {renderField(field, formik)}
            {field.name === 'date_of_birth' && jobPosts && jobPosts.length > 1 && (
              <Box sx={{ mt: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Select Job Post</InputLabel>
                  <Select
                    value={selectedJobPost}
                    label="Select Job Post"
                    onChange={onJobChange}
                  >
                    {jobPosts.map((post) => (
                      <MenuItem key={post.id} value={post.id}>
                        {post.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>
        ))}
        {photoField && (
          <Box key={photoField.name}>
            {renderField(photoField, formik)}
          </Box>
        )}
        {signatureField && (
          <Box key={signatureField.name}>
            {renderField(signatureField, formik)}
          </Box>
        )}
        {declarationField && (
          <Box key={declarationField.name}>
            {renderField(declarationField, formik)}
          </Box>
        )}
        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
          Submit Application
        </Button>
      </Stack>
    </form>
  );
};

export default DynamicForm;
