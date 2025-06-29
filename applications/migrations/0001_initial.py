# Generated by Django 5.2.2 on 2025-06-14 12:49

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('agencies', '0002_agency_default_form_schema'),
    ]

    operations = [
        migrations.CreateModel(
            name='Application',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(max_length=255)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(max_length=20)),
                ('form_data', models.JSONField()),
                ('photo', models.ImageField(upload_to='applications/photos/')),
                ('signature', models.ImageField(upload_to='applications/signatures/')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('reviewing', 'Reviewing'), ('shortlisted', 'Shortlisted'), ('rejected', 'Rejected'), ('hired', 'Hired')], default='pending', max_length=20)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('job_post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='applications', to='agencies.jobpost')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ApplicationDocument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('document_type', models.CharField(max_length=50)),
                ('file', models.FileField(upload_to='applications/documents/')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='applications.application')),
            ],
            options={
                'ordering': ['-uploaded_at'],
            },
        ),
        migrations.AddIndex(
            model_name='application',
            index=models.Index(fields=['job_post', 'status'], name='application_job_pos_ac6c2a_idx'),
        ),
        migrations.AddIndex(
            model_name='application',
            index=models.Index(fields=['email'], name='application_email_c09a19_idx'),
        ),
    ]
