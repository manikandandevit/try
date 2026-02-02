"""
Admin configuration for quotations app.
"""
from django.contrib import admin
from .models import Quotation, Company_Credentials


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ['id', 'created_at', 'updated_at', 'get_grand_total_display']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_grand_total_display(self, obj):
        return f"₹{obj.get_grand_total():,.2f}"
    get_grand_total_display.short_description = 'Grand Total'


@admin.register(Company_Credentials)
class Company_CredentialsAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'phone_number', 'company_mail', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['company_name', 'company_mail', 'phone_number']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Company Information', {
            'fields': ('logo', 'company_name', 'company_mail')
        }),
        ('Contact Details', {
            'fields': ('phone_number', 'address')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
