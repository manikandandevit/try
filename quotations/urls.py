"""
URLs for quotations app.
"""
from django.urls import path
from . import views

app_name = 'quotations'

urlpatterns = [
    path('', views.index, name='index'),
    path('api/chat/', views.chat, name='chat'),
    path('api/quotation/', views.get_quotation, name='get_quotation'),
    path('api/reset/', views.reset_quotation, name='reset_quotation'),
    path('api/sync-quotation/', views.sync_quotation, name='sync_quotation'),
    path('api/company-info/', views.get_company_info, name='get_company_info'),
]
