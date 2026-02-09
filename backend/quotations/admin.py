"""
Admin configuration for quotations app.
"""
from django.contrib import admin
from .models import Quotation, Company, Client, User, QuotationSend


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ['id', 'created_at', 'updated_at', 'get_grand_total_display']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_grand_total_display(self, obj):
        return f"₹{obj.get_grand_total():,.2f}"
    get_grand_total_display.short_description = 'Grand Total'


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['email', 'sendemail', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['email', 'sendemail']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Login Credentials', {
            'fields': ('email', 'password')
        }),
        ('Send Email Credentials', {
            'fields': ('sendemail', 'sendpassword'),
            'description': 'Email credentials for sending quotations via email'
        }),
        ('Send WhatsApp Number', {
            'fields': ('sendnumber',),
            'description': 'WhatsApp number for sending quotations via WhatsApp'
        }),
        ('Images', {
            'fields': ('login_logo', 'login_image', 'quotation_logo'),
            'description': 'Login images and quotation header logo'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        """Prevent adding multiple companies - only one allowed."""
        if Company.objects.exists():
            return False
        return super().has_add_permission(request)
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deleting the company - must always exist."""
        return False


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['customer_name', 'company_name', 'phone_number', 'email', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['customer_name', 'company_name', 'email', 'phone_number']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Customer Information', {
            'fields': ('customer_name', 'company_name', 'phone_number', 'email', 'address')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'get_full_name', 'is_active', 'is_admin', 'created_at']
    list_filter = ['is_active', 'is_admin', 'created_at', 'updated_at']
    search_fields = ['email', 'first_name', 'last_name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('User Information', {
            'fields': ('email', 'first_name', 'last_name', 'is_active')
        }),
        ('Permissions', {
            'fields': ('is_admin', 'permissions'),
            'description': 'Admin has full access. For regular users, select specific permissions.'
        }),
        ('Authentication', {
            'fields': ('password',),
            'description': 'Password is hashed automatically. Leave blank to keep current password when editing.'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_full_name(self, obj):
        return obj.get_full_name() or '-'
    get_full_name.short_description = 'Full Name'


@admin.register(QuotationSend)
class QuotationSendAdmin(admin.ModelAdmin):
    list_display = ['id', 'quotation', 'send_type', 'recipient_email', 'recipient_phone', 'sent_at']
    list_filter = ['send_type', 'sent_at', 'created_at']
    search_fields = ['recipient_email', 'recipient_phone', 'quotation__id']
    readonly_fields = ['created_at']
    date_hierarchy = 'sent_at'
    fieldsets = (
        ('Send Information', {
            'fields': ('quotation', 'send_type', 'recipient_email', 'recipient_phone', 'sent_at')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
