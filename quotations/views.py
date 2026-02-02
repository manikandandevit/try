"""
Views for quotations app.
"""
import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from .services import OpenRouterService, QuotationManager


def index(request):
    """Main page with chat interface."""
    return render(request, 'quotations/index.html')


@csrf_exempt
@require_http_methods(["POST"])
def chat(request):
    """Handle chat messages and return AI response with updated quotation."""
    try:
        data = json.loads(request.body)
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return JsonResponse({
                'error': 'Message is required'
            }, status=400)
        
        # Get current quotation from session
        current_quotation = request.session.get('quotation', None)
        if current_quotation is None:
            current_quotation = QuotationManager.initialize_quotation()
        
        # Get conversation history from session
        conversation_history = request.session.get('conversation_history', [])
        
        # Process message with AI
        openrouter_service = OpenRouterService()
        message, updated_quotation = openrouter_service.process_user_message(
            user_message=user_message,
            current_quotation=current_quotation,
            conversation_history=conversation_history
        )
        
        # Normalize and validate quotation (already done in process_user_message, but do it again for safety)
        updated_quotation = QuotationManager.normalize_quotation(updated_quotation)
        
        # Validate after normalization
        if not QuotationManager.validate_quotation(updated_quotation):
            # If still invalid after normalization, keep current quotation
            updated_quotation = QuotationManager.normalize_quotation(current_quotation)
            # Update message to indicate issue
            if "issue" not in message.lower() and "error" not in message.lower():
                message = message + " (Note: Some quotation data was invalid and has been corrected.)"
        
        # Save to session
        request.session['quotation'] = updated_quotation
        
        # Update conversation history (keep last 10 messages)
        conversation_history.append({
            "role": "user",
            "content": user_message
        })
        conversation_history.append({
            "role": "assistant",
            "content": message
        })
        request.session['conversation_history'] = conversation_history[-10:]
        
        return JsonResponse({
            'response': message,
            'quotation': updated_quotation
        })
    
    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'Invalid JSON in request body'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'error': f'Server error: {str(e)}'
        }, status=500)


@require_http_methods(["GET"])
def get_quotation(request):
    """Get current quotation from session."""
    quotation = request.session.get('quotation', QuotationManager.initialize_quotation())
    return JsonResponse({
        'quotation': quotation
    })


@require_http_methods(["POST"])
def reset_quotation(request):
    """Reset quotation to empty state."""
    request.session['quotation'] = QuotationManager.initialize_quotation()
    request.session['conversation_history'] = []
    return JsonResponse({
        'success': True,
        'quotation': QuotationManager.initialize_quotation()
    })


@csrf_exempt
@require_http_methods(["POST"])
def sync_quotation(request):
    """Sync quotation state from frontend (for instant updates)."""
    try:
        data = json.loads(request.body)
        quotation = data.get('quotation', None)
        
        if not quotation:
            return JsonResponse({
                'error': 'Quotation data is required'
            }, status=400)
        
        # Normalize and validate quotation
        quotation = QuotationManager.normalize_quotation(quotation)
        
        # Validate after normalization
        if not QuotationManager.validate_quotation(quotation):
            return JsonResponse({
                'error': 'Invalid quotation structure'
            }, status=400)
        
        # Save to session
        request.session['quotation'] = quotation
        
        return JsonResponse({
            'success': True,
            'quotation': quotation
        })
    
    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'Invalid JSON in request body'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'error': f'Server error: {str(e)}'
        }, status=500)


@require_http_methods(["GET"])
def get_company_info(request):
    """Get company information for header display."""
    try:
        from .models import Company_Credentials
        from django.conf import settings
        
        # Default values
        company_info = {
            'company_name': 'MAKLOGISTICS',
            'tagline': 'DIGITAL SOLUTION ARCHITECTS',
            'phone_number': '9042510714',
            'email': 'maklogistics@gmail.com',
            'address': 'TBI@TCE, Thiruparankundaram, Madurai – 625 015',
            'logo_url': None
        }
        
        company = Company_Credentials.objects.first()
        
        if company:
            company_info['company_name'] = company.company_name or company_info['company_name']
            company_info['phone_number'] = company.phone_number or company_info['phone_number']
            company_info['email'] = company.company_mail or company_info['email']
            company_info['address'] = company.address or company_info['address']
            
            if company.logo:
                # Build full URL for the logo
                logo_url = company.logo.url
                if not logo_url.startswith('http'):
                    # Make it an absolute URL
                    request_scheme = request.scheme
                    request_host = request.get_host()
                    company_info['logo_url'] = f"{request_scheme}://{request_host}{logo_url}"
                else:
                    company_info['logo_url'] = logo_url
        
        return JsonResponse(company_info)
    except Exception as e:
        return JsonResponse({
            'error': f'Error fetching company info: {str(e)}'
        }, status=500)



