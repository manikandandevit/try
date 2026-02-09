# Generated migration for QuotationSend model

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('quotations', '0018_client_is_active'),
    ]

    operations = [
        migrations.CreateModel(
            name='QuotationSend',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('send_type', models.CharField(choices=[('email', 'Email'), ('whatsapp', 'WhatsApp')], help_text='Type of send: email or whatsapp', max_length=10)),
                ('recipient_email', models.EmailField(blank=True, help_text='Recipient email (for email sends)', max_length=254, null=True)),
                ('recipient_phone', models.CharField(blank=True, help_text='Recipient phone (for WhatsApp sends)', max_length=20, null=True)),
                ('sent_at', models.DateTimeField(default=django.utils.timezone.now, help_text='When the quotation was sent')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('quotation', models.ForeignKey(help_text='Quotation that was sent', on_delete=django.db.models.deletion.CASCADE, related_name='sends', to='quotations.quotation')),
            ],
            options={
                'verbose_name': 'Quotation Send',
                'verbose_name_plural': 'Quotation Sends',
                'ordering': ['-sent_at'],
            },
        ),
    ]

