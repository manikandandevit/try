"""
Quotation Manager - Handles quotation state management
"""
from typing import Dict, Any, Optional
from quotations.models import Quotation


class QuotationManager:
    """
    Manages quotation state in database and session
    """
    
    @staticmethod
    def get_default_quotation() -> Dict[str, Any]:
        """Get default empty quotation structure"""
        return {
            "services": [],
            "subtotal": 0,
            "grand_total": 0
        }
    
    @staticmethod
    def get_quotation_for_session(session_key: str) -> Dict[str, Any]:
        """
        Get quotation for a session from database
        """
        try:
            quotation_obj = Quotation.objects.filter(session_key=session_key).first()
            if quotation_obj:
                return quotation_obj.get_quotation_dict()
        except Exception:
            pass
        
        return QuotationManager.get_default_quotation()
    
    @staticmethod
    def save_quotation_for_session(session_key: str, quotation_data: Dict[str, Any]) -> Quotation:
        """
        Save quotation for a session
        """
        quotation_obj, created = Quotation.objects.get_or_create(
            session_key=session_key,
            defaults={'quotation_data': quotation_data}
        )
        
        if not created:
            quotation_obj.update_quotation(quotation_data)
        
        return quotation_obj
    
    @staticmethod
    def clear_quotation_for_session(session_key: str):
        """
        Clear quotation for a session
        """
        Quotation.objects.filter(session_key=session_key).delete()



