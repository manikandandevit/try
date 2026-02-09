# Generated migration to remove authentication fields for single company setup

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('quotations', '0005_company_credentials_email_password'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='company_credentials',
            name='email',
        ),
        migrations.RemoveField(
            model_name='company_credentials',
            name='password',
        ),
    ]






