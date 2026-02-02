"""
Ollama Service - Handles communication with Ollama API
"""
import json
import requests
from django.conf import settings
from typing import Dict, Any, Optional


class OllamaService:
    """
    Service to interact with Ollama HTTP API
    """
    
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.api_url = f"{self.base_url}/api/generate"
    
    def check_connection(self) -> bool:
        """
        Check if Ollama is available and responding
        
        Returns:
            True if Ollama is available, False otherwise
        """
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def get_system_prompt(self) -> str:
        """
        Returns the system prompt for KATTAPPA AI
        """
        return """You are KATTAPPA, an AI Quotation Assistant.

Your responsibilities:
1. Help users create professional quotations by asking for missing information
2. Maintain quotation JSON state accurately
3. Support partial edits - only modify what the user explicitly requests
4. Never delete or regenerate the entire quotation unless explicitly told
5. Always return both:
   - A natural language response
   - Updated quotation JSON data

Quotation Structure:
{
  "services": [
    {
      "service_name": "string",
      "quantity": number,
      "unit_rate": number,
      "amount": number (quantity * unit_rate)
    }
  ],
  "subtotal": number (sum of all amounts),
  "grand_total": number (same as subtotal for now)
}

Intent Detection:
- "create" / "new" / "start" → Create new quotation
- "edit" / "change" / "update" → Modify existing service
- "add" → Add new service to existing quotation
- "remove" / "delete" → Remove a service
- "regenerate" / "reset" → Start fresh

Partial Edit Rules:
- If user says "Change Transport Service into Lorry Service" → Update ONLY service_name
- If user says "Change budget into 25000" → Update ONLY unit_rate and recalculate amount
- If user says "Change quantity to 5" → Update ONLY quantity and recalculate amount
- Always recalculate amount = quantity * unit_rate
- Always recalculate subtotal and grand_total

Response Format:
You must respond in JSON format:
{
  "intent": "create|edit|add|remove|regenerate",
  "message": "Your natural language response to the user",
  "quotation": {
    "services": [...],
    "subtotal": 0,
    "grand_total": 0
  }
}

Important:
- Ask only for missing information
- Be conversational and friendly
- Calculate amounts automatically
- Maintain currency as ₹ (Indian Rupees)"""

    def call_ollama(self, user_message: str, current_quotation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send request to Ollama API and get response
        
        Args:
            user_message: User's input message
            current_quotation: Current quotation state as dict
            
        Returns:
            Dict with 'intent', 'message', and 'quotation' keys
        """
        system_prompt = self.get_system_prompt()
        
        # Build the prompt with context
        context = f"""Current Quotation State:
{json.dumps(current_quotation, indent=2)}

User Message: {user_message}

Please analyze the user's intent and respond with the updated quotation in the required JSON format."""

        full_prompt = f"{system_prompt}\n\n{context}"
        
        # Check if Ollama is available before making the request
        if not self.check_connection():
            return {
                "intent": "error",
                "message": f"Cannot connect to Ollama at {self.base_url}. Please ensure Ollama is running. You can start it by running 'ollama serve' in your terminal.",
                "quotation": current_quotation
            }
        
        payload = {
            "model": self.model,
            "prompt": full_prompt,
            "stream": False,
            "format": "json",  # Request JSON response
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
            }
        }
        
        try:
            # Increase timeout to 120 seconds for larger models
            # Also set a longer read timeout since model generation can take time
            response = requests.post(
                self.api_url,
                json=payload,
                timeout=(10, 120)  # (connect timeout, read timeout)
            )
            response.raise_for_status()
            
            result = response.json()
            ai_response_text = result.get('response', '')
            
            # Try to parse JSON from response
            try:
                # Remove markdown code blocks if present
                ai_response_text = ai_response_text.strip()
                if ai_response_text.startswith('```json'):
                    ai_response_text = ai_response_text[7:]
                if ai_response_text.startswith('```'):
                    ai_response_text = ai_response_text[3:]
                if ai_response_text.endswith('```'):
                    ai_response_text = ai_response_text[:-3]
                ai_response_text = ai_response_text.strip()
                
                parsed_response = json.loads(ai_response_text)
                
                # Validate and ensure quotation structure
                if 'quotation' not in parsed_response:
                    parsed_response['quotation'] = current_quotation
                
                # Ensure proper structure
                quotation = parsed_response.get('quotation', {})
                if 'services' not in quotation:
                    quotation['services'] = []
                if 'subtotal' not in quotation:
                    quotation['subtotal'] = 0
                if 'grand_total' not in quotation:
                    quotation['grand_total'] = 0
                
                # Recalculate totals to ensure accuracy
                self._recalculate_totals(quotation)
                
                parsed_response['quotation'] = quotation
                
                return parsed_response
                
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract JSON from text
                import re
                json_match = re.search(r'\{.*\}', ai_response_text, re.DOTALL)
                if json_match:
                    try:
                        parsed_response = json.loads(json_match.group())
                        if 'quotation' not in parsed_response:
                            parsed_response['quotation'] = current_quotation
                        self._recalculate_totals(parsed_response.get('quotation', {}))
                        return parsed_response
                    except:
                        pass
                
                # Fallback: return natural language response with current quotation
                return {
                    "intent": "edit",
                    "message": ai_response_text,
                    "quotation": current_quotation
                }
                
        except requests.exceptions.Timeout as e:
            # Handle timeout errors specifically
            return {
                "intent": "error",
                "message": f"Request timed out. The model is taking longer than expected to respond. Please try again or check if Ollama is running properly. Error: {str(e)}",
                "quotation": current_quotation
            }
        except requests.exceptions.ConnectionError as e:
            # Handle connection errors
            return {
                "intent": "error",
                "message": f"Cannot connect to Ollama at {self.base_url}. Please ensure Ollama is running. You can start it by running 'ollama serve' in your terminal.",
                "quotation": current_quotation
            }
        except requests.exceptions.RequestException as e:
            # Handle other request errors
            return {
                "intent": "error",
                "message": f"Error connecting to Ollama: {str(e)}. Please ensure Ollama is running and the model '{self.model}' is installed.",
                "quotation": current_quotation
            }
        except Exception as e:
            return {
                "intent": "error",
                "message": f"An error occurred: {str(e)}",
                "quotation": current_quotation
            }
    
    def _recalculate_totals(self, quotation: Dict[str, Any]):
        """
        Recalculate amounts and totals in quotation
        """
        if 'services' not in quotation:
            quotation['services'] = []
        
        subtotal = 0
        for service in quotation['services']:
            # Ensure all fields exist
            if 'quantity' not in service:
                service['quantity'] = 0
            if 'unit_rate' not in service:
                service['unit_rate'] = 0
            
            # Calculate amount
            service['amount'] = float(service['quantity']) * float(service['unit_rate'])
            subtotal += service['amount']
        
        quotation['subtotal'] = subtotal
        quotation['grand_total'] = subtotal  # For now, grand_total = subtotal

