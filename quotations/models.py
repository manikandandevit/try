"""
Models for quotations app.
"""
from django.db import models
from django.utils import timezone
import json


class Quotation(models.Model):
    """Model to store quotation data."""
    quotation_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Quotation {self.id} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    def get_services(self):
        """Get services from quotation data."""
        return self.quotation_data.get('services', [])
    
    def get_subtotal(self):
        """Get subtotal from quotation data."""
        return self.quotation_data.get('subtotal', 0)
    
    def get_grand_total(self):
        """Get grand total from quotation data."""
        return self.quotation_data.get('grand_total', 0)


class Company_Credentials(models.Model):
    """Model to store company credentials and information."""
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True, help_text="Company Logo")
    company_name = models.CharField(max_length=255, help_text="Company Name")
    phone_number = models.CharField(max_length=20, help_text="Phone Number")
    address = models.TextField(help_text="Company Address")
    company_mail = models.EmailField(help_text="Company Email")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Company Credential'
        verbose_name_plural = 'Company Credentials'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.company_name