from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quotations', '0017_refreshtoken'),
    ]

    operations = [
        migrations.AddField(
            model_name='client',
            name='is_active',
            field=models.BooleanField(default=True, help_text='Is this customer active/enabled in dashboard toggle'),
        ),
    ]


