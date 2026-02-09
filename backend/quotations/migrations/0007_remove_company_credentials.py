# Generated migration to remove Company_Credentials model for single company setup

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('quotations', '0006_remove_company_credentials_email_password'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Company_Credentials',
        ),
    ]






