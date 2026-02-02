"""
Services for OpenRouter API integration and quotation management.
"""
import json
import re
import requests
from django.conf import settings
from typing import Dict, Any, Optional, Tuple


class OpenRouterService:
    """Service to handle OpenRouter API interactions."""
    
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.model = settings.OPENROUTER_MODEL
        self.api_url = settings.OPENROUTER_API_URL
        
        # Debug: Check if API key is loaded (remove in production)
        if not self.api_key:
            print("WARNING: OPENROUTER_API_KEY is not set in Django settings!")
            print("Please check your .env file or environment variables.")
    
    def get_system_prompt(self) -> str:
        """Get the system prompt for KATTAPPA AI assistant."""
        return """You are KATTAPPA, a professional AI Quotation Assistant.

THIS IS A STRICT SYSTEM PROMPT.
FOLLOW EVERY RULE WITHOUT EXCEPTION.

----------------------------------
CORE PRINCIPLE
----------------------------------
You do NOT control the quotation by words.
You control the quotation ONLY by structured data (JSON).

The UI will render the quotation ONLY from the JSON you return.

----------------------------------
MANDATORY RESPONSE FORMAT
----------------------------------
EVERY response MUST be valid JSON in this exact format:

{
  "message": "<short human readable reply>",
  "quotation": {
    "services": [
      {
        "service_name": "",
        "quantity": 0,
        "unit_price": 0,
        "amount": 0
      }
    ],
    "subtotal": 0,
    "gst_percentage": 0,
    "gst_amount": 0,
    "grand_total": 0
  }
}

NO extra text.
NO markdown.
NO explanations outside JSON.
ONLY return the JSON object.

----------------------------------
STATE MANAGEMENT RULES
----------------------------------
1. ALWAYS use the existing quotation state provided in the context.
2. NEVER reset quotation unless user clearly says:
   "reset", "start over", "new quotation", "clear all".
3. NEVER remove a service unless user clearly says:
   "remove", "delete", "drop".

----------------------------------
SERVICE NAME CHANGE RULES (CRITICAL)
----------------------------------
When user asks to change a service name:

Examples of valid requests:
- "change the Service Name Vehicle to Website Service"
- "change Vehicle to Website Service"
- "change service name Vehicle to Website Service"
- "rename Vehicle to Website Service"
- "change Vehicle service name to Website Service"

Steps to follow:
1. Find the service with matching name (case-insensitive, partial match OK)
2. Update ONLY the service_name field
3. Keep ALL other fields unchanged (quantity, unit_price, amount)
4. Recalculate: amount = quantity × unit_price
5. Recalculate: subtotal, gst_amount, grand_total
6. Return the COMPLETE quotation with ALL services

IMPORTANT: If multiple services match, update the FIRST matching service.
If no service matches, ask for clarification but DO NOT modify quotation.

----------------------------------
EDITING RULES (CRITICAL)
----------------------------------
If the user asks to change something:

• Change ONLY the mentioned field.
• Recalculate dependent values.
• Leave everything else untouched.

Examples:

- "change price 25000 to 40000" or "change price to 40000"
  → Find service with price 25000, update unit_price to 40000
  → Recalculate: amount, subtotal, gst_amount, grand_total

- "change quantity 1 to 5" or "change quantity to 5"
  → Update quantity of the last service (or matching service)
  → Recalculate: amount, subtotal, gst_amount, grand_total

- "change GST 8 to 10" or "change GST to 10"
  → Update gst_percentage to 10
  → Recalculate: gst_amount, grand_total

- "change service name X to Y"
  → Find service with name X, update service_name to Y
  → Keep quantity, unit_price unchanged
  → Recalculate: amount, subtotal, gst_amount, grand_total

----------------------------------
CALCULATION RULES
----------------------------------
amount = quantity × unit_price (for each service)
subtotal = sum of all service amounts
gst_amount = (subtotal × gst_percentage) / 100
grand_total = subtotal + gst_amount

Round all monetary values to 2 decimal places.

----------------------------------
ADDING SERVICES RULES
----------------------------------
If the user asks to ADD a service:

1. Check if BOTH quantity and unit_price are provided in the request.
2. If BOTH are provided:
   - Add the service immediately
   - Recalculate totals
3. If ANY value is missing:
   - DO NOT modify quotation JSON
   - Ask a clear follow-up question
   - Example: "What quantity and price should I use for [service name]?"

Examples of valid ADD commands:
- "add service Tiles Work Quantity 5 price 5450" → Extract: service_name="Tiles Work", quantity=5, unit_price=5450
- "add Tiles Work quantity 5 and price 5450" → Extract: service_name="Tiles Work", quantity=5, unit_price=5450
- "add service Web Development with quantity 2 and price 25000" → Extract: service_name="Web Development", quantity=2, unit_price=25000

IMPORTANT: When parsing "add service X Quantity Y price Z":
- The service name is everything between "service" (or "add") and "Quantity"/"quantity"/"qty"
- Do NOT include "Quantity" or "qty" in the service name
- Extract the numeric values for quantity and price correctly

----------------------------------
REMOVING SERVICES RULES
----------------------------------
If the user asks to REMOVE or DELETE a service:

1. Extract the service name from the command
2. Find the matching service (case-insensitive, partial match OK)
3. Remove ONLY that service
4. Recalculate totals

Examples of valid REMOVE commands:
- "remove pipeline works quantity 10 and price 1200" → Extract service_name="pipeline works" (ignore quantity/price)
- "remove Tiles Work" → Remove service with name containing "Tiles Work"
- "delete Construction Work" → Remove service with name containing "Construction Work"

IMPORTANT: When parsing "remove X quantity Y price Z":
- The service name is everything before "quantity"/"qty"
- Ignore quantity and price values in remove commands - they're just for identification
- Use the service name to find and remove the matching service

----------------------------------
INVALID PARSE RULE
----------------------------------
If the instruction cannot be parsed clearly:
- Do NOT change quotation
- Return current quotation unchanged
- Respond with a helpful clarification question

----------------------------------
QUESTION RULE
----------------------------------
Ask a question ONLY if required data is missing.
Never repeat already provided information.
Keep questions short and specific.

----------------------------------
BUSINESS RULES
----------------------------------
- Currency: INR (₹)
- Default GST for Indian services: 18% (if not specified)
- Foreign client → GST 0%
- All prices in Indian Rupees

----------------------------------
FAIL-SAFE RULE
----------------------------------
If user instruction is unclear:
- Return current quotation unchanged
- Ask ONE clear clarification question
- Do NOT guess or make assumptions

----------------------------------
JSON VALIDATION
----------------------------------
Before returning:
1. Ensure ALL services have: service_name, quantity, unit_price, amount
2. Ensure quotation has: services, subtotal, gst_percentage, gst_amount, grand_total
3. Ensure all numeric values are numbers (not strings)
4. Ensure amounts are calculated correctly

----------------------------------
REMEMBER
----------------------------------
If the preview is wrong, YOU are wrong.
Your JSON is the single source of truth.
ALWAYS return valid JSON that matches the exact format above."""
    
    def chat_completion(self, messages: list) -> Optional[str]:
        """Send chat completion request to OpenRouter API."""
        if not self.api_key:
            print("OpenRouter API Error: API key is not set")
            return None
        
        # OpenRouter API headers (correct format)
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://kattappa.local',  # Optional: for tracking
            'X-Title': 'KATTAPPA AI Quotation Maker'  # Optional: app name
        }
        
        payload = {
            'model': self.model,
            'messages': messages,
            'temperature': 0.3,  # Lower temperature for more consistent JSON output
            'max_tokens': 2000
        }
        
        # Try to use JSON mode if the model supports it
        # Many models support response_format for structured output
        json_mode_models = [
            'anthropic/claude',
            'openai/gpt',
            'google/gemini',
            'meta-llama/llama-3',
            'mistralai/mistral'
        ]
        
        if any(model_name in self.model.lower() for model_name in json_mode_models):
            try:
                payload['response_format'] = {'type': 'json_object'}
            except:
                pass  # Some models don't support this parameter
        
        # Note: The system prompt is strict about returning JSON only.
        # The parsing logic handles both pure JSON and markdown-wrapped JSON.
        
        try:
            # Debug: Print request details (remove in production)
            print(f"OpenRouter API Request - URL: {self.api_url}")
            print(f"OpenRouter API Request - Model: {self.model}")
            print(f"OpenRouter API Request - API Key present: {bool(self.api_key)}")
            
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=30
            )
            
            # Better error handling with detailed messages
            if response.status_code == 404:
                try:
                    error_data = response.json() if response.text else {}
                    error_detail = error_data.get('error', {})
                    error_message = error_detail.get('message', 'Unknown error')
                    metadata = error_detail.get('metadata', {})
                    raw_error = metadata.get('raw', '')
                    
                    # Check if it's a model not found error
                    if 'model' in error_message.lower() or 'route' in error_message.lower() or 'matching route' in raw_error.lower():
                        error_msg = f"❌ OpenRouter API Error: Model '{self.model}' not found or not available.\n"
                        error_msg += f"\nThe model you specified doesn't exist on OpenRouter.\n"
                        error_msg += f"\n✅ Valid free models you can use:\n"
                        error_msg += f"  - meta-llama/llama-3.1-8b-instruct:free\n"
                        error_msg += f"  - meta-llama/llama-3.1-70b-instruct:free\n"
                        error_msg += f"  - google/gemini-flash-1.5:free\n"
                        error_msg += f"  - microsoft/phi-3-mini-128k-instruct:free\n"
                        error_msg += f"\n💡 To fix: Update OPENROUTER_MODEL in your .env file and restart the server.\n"
                        print(error_msg)
                    else:
                        error_msg = f"OpenRouter API 404 Error: Endpoint not found.\n"
                        error_msg += f"URL: {self.api_url}\n"
                        error_msg += f"Response: {response.text}\n"
                        print(error_msg)
                except:
                    error_msg = f"OpenRouter API 404 Error: {response.text}\n"
                    print(error_msg)
                return None
            elif response.status_code == 401:
                error_msg = "OpenRouter API 401 Error: Invalid API key.\n"
                error_msg += "Please check your OPENROUTER_API_KEY in .env file.\n"
                error_msg += f"API Key present: {bool(self.api_key)}, Length: {len(self.api_key) if self.api_key else 0}"
                print(error_msg)
                return None
            elif response.status_code != 200:
                error_msg = f"OpenRouter API Error {response.status_code}:\n"
                error_msg += f"Response: {response.text}"
                print(error_msg)
                return None
            
            response.raise_for_status()
            data = response.json()
            
            # Check for errors in response
            if 'error' in data:
                error_detail = data['error']
                if isinstance(error_detail, dict):
                    print(f"OpenRouter API Error: {error_detail.get('message', error_detail)}")
                else:
                    print(f"OpenRouter API Error: {error_detail}")
                return None
            
            return data.get('choices', [{}])[0].get('message', {}).get('content', '')
        except requests.exceptions.RequestException as e:
            print(f"OpenRouter API Request Error: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response status: {e.response.status_code}")
                print(f"Response text: {e.response.text}")
            return None
        except Exception as e:
            print(f"OpenRouter API Error: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def parse_response_json(self, response_text: str) -> Optional[Dict[str, Any]]:
        """Parse JSON-only response from AI. Returns dict with 'message' and 'quotation' keys."""
        if not response_text or not response_text.strip():
            return None
        
        # Clean response text - remove markdown code blocks if present
        cleaned_text = response_text.strip()
        
        # Remove markdown code blocks (handle various formats)
        if cleaned_text.startswith('```json'):
            cleaned_text = cleaned_text[7:]
        elif cleaned_text.startswith('```'):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith('```'):
            cleaned_text = cleaned_text[:-3]
        cleaned_text = cleaned_text.strip()
        
        # Remove any leading/trailing whitespace or newlines
        cleaned_text = cleaned_text.strip()
        
        # Try to parse as JSON directly
        try:
            parsed = json.loads(cleaned_text)
            # Validate structure
            if isinstance(parsed, dict) and 'message' in parsed and 'quotation' in parsed:
                # Validate quotation structure
                quotation = parsed.get('quotation', {})
                if isinstance(quotation, dict) and 'services' in quotation:
                    return parsed
        except json.JSONDecodeError as e:
            # Try to find the JSON object in the response
            pass
        
        # Fallback: try to find JSON object in response using multiple strategies
        # Strategy 1: Find first { and last } (handles nested objects)
        try:
            first_brace = cleaned_text.find('{')
            last_brace = cleaned_text.rfind('}')
            if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
                potential_json = cleaned_text[first_brace:last_brace + 1]
                parsed = json.loads(potential_json)
                if isinstance(parsed, dict) and 'message' in parsed and 'quotation' in parsed:
                    quotation = parsed.get('quotation', {})
                    if isinstance(quotation, dict) and 'services' in quotation:
                        return parsed
        except (json.JSONDecodeError, ValueError):
            pass
        
        # Strategy 2: Use regex to find JSON-like structures
        try:
            # More sophisticated pattern that handles nested objects
            json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
            matches = re.finditer(json_pattern, cleaned_text, re.DOTALL)
            
            for match in matches:
                try:
                    potential_json = match.group(0)
                    parsed = json.loads(potential_json)
                    if isinstance(parsed, dict) and 'message' in parsed and 'quotation' in parsed:
                        quotation = parsed.get('quotation', {})
                        if isinstance(quotation, dict) and 'services' in quotation:
                            return parsed
                except json.JSONDecodeError:
                    continue
        except Exception:
            pass
        
        # Strategy 3: Try to extract JSON from lines (sometimes AI adds text before/after)
        try:
            lines = cleaned_text.split('\n')
            json_lines = []
            in_json = False
            for line in lines:
                stripped = line.strip()
                if stripped.startswith('{'):
                    in_json = True
                    json_lines = [line]
                elif in_json:
                    json_lines.append(line)
                    if stripped.endswith('}') and stripped.count('{') <= stripped.count('}'):
                        potential_json = '\n'.join(json_lines)
                        parsed = json.loads(potential_json)
                        if isinstance(parsed, dict) and 'message' in parsed and 'quotation' in parsed:
                            quotation = parsed.get('quotation', {})
                            if isinstance(quotation, dict) and 'services' in quotation:
                                return parsed
                        in_json = False
                        json_lines = []
        except (json.JSONDecodeError, ValueError):
            pass
        
        return None
    
    def process_user_message(
        self, 
        user_message: str, 
        current_quotation: Optional[Dict[str, Any]] = None,
        conversation_history: list = None
    ) -> Tuple[str, Optional[Dict[str, Any]]]:
        """
        Process user message and return AI response with updated quotation.
        
        Returns:
            Tuple of (message, updated_quotation_json)
        """
        if conversation_history is None:
            conversation_history = []
        
        # Initialize quotation if not provided
        if current_quotation is None:
            current_quotation = QuotationManager.initialize_quotation()
        
        # Build messages for API
        messages = [
            {
                "role": "system",
                "content": self.get_system_prompt()
            }
        ]
        
        # Add conversation history
        messages.extend(conversation_history)
        
        # Add current quotation context
        messages.append({
            "role": "system",
            "content": f"Current quotation state: {json.dumps(current_quotation, indent=2)}"
        })
        
        # Add user message
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        # Get AI response
        ai_response = self.chat_completion(messages)
        
        if not ai_response:
            return "I'm sorry, I'm having trouble connecting to the AI service. Please check your API key.", current_quotation
        
        # Parse JSON response (should contain both message and quotation)
        parsed_response = self.parse_response_json(ai_response)
        
        if parsed_response:
            message = parsed_response.get('message', 'I\'ve updated the quotation.')
            updated_quotation = parsed_response.get('quotation', current_quotation)
            
            # Normalize the quotation to ensure consistency
            updated_quotation = QuotationManager.normalize_quotation(updated_quotation)
            
            # Validate the normalized quotation
            if not QuotationManager.validate_quotation(updated_quotation):
                # If invalid, use current quotation but keep the message
                return message + " However, there was an issue with the quotation format. Please try again.", current_quotation
            
            return message, updated_quotation
        
        # Fallback: if parsing fails, try to extract just the message
        # Sometimes AI returns text before/after JSON
        fallback_message = "I'm sorry, I couldn't parse the response properly. "
        
        # Try to provide a helpful message based on user input
        user_lower = user_message.lower()
        if 'remove' in user_lower or 'delete' in user_lower:
            # Try to extract service name and remove it manually as fallback
            remove_match = re.search(r'(?:remove|delete)\s+(.+?)(?:\s+quantity|\s+price|$)', user_message, re.IGNORECASE)
            if remove_match:
                service_name_to_remove = remove_match.group(1).strip()
                # Clean up service name
                service_name_to_remove = re.sub(r'\s+(?:works?|service)\s*$', '', service_name_to_remove, flags=re.IGNORECASE).strip()
                
                # Try to find and remove the service
                if current_quotation and current_quotation.get('services'):
                    for i, service in enumerate(current_quotation['services']):
                        service_name = service.get('service_name', '').lower()
                        to_remove_lower = service_name_to_remove.lower()
                        if service_name == to_remove_lower or service_name in to_remove_lower or to_remove_lower in service_name:
                            # Remove the service
                            current_quotation['services'].pop(i)
                            # Recalculate totals
                            current_quotation = QuotationManager.calculate_totals(current_quotation)
                            return f"I've removed '{service_name_to_remove}' from the quotation.", current_quotation
            
            fallback_message += "Please specify the service name to remove, for example: 'Remove [service name]'"
        elif 'add' in user_lower:
            # Try to extract service, quantity, and price manually as fallback
            add_patterns = [
                r'add\s+service\s+(.+?)\s+(?:quantity|qty)\s+(\d+)\s+(?:and\s+)?(?:price|rate)\s+(\d+(?:\.\d+)?)',
                r'add\s+(.+?)\s+(?:quantity|qty)\s+(\d+)\s+(?:and\s+)?(?:price|rate)\s+(\d+(?:\.\d+)?)',
            ]
            
            for pattern in add_patterns:
                add_match = re.search(pattern, user_message, re.IGNORECASE)
                if add_match:
                    service_name = add_match.group(1).strip()
                    service_name = re.sub(r'\s+service\s*$', '', service_name, flags=re.IGNORECASE).strip()
                    service_name = re.sub(r'\s+(?:quantity|qty)\s*$', '', service_name, flags=re.IGNORECASE).strip()
                    quantity = int(add_match.group(2))
                    price = float(add_match.group(3))
                    
                    if service_name and quantity > 0 and price > 0:
                        # Add the service
                        if current_quotation is None:
                            current_quotation = QuotationManager.initialize_quotation()
                        
                        new_service = {
                            'service_name': service_name,
                            'quantity': quantity,
                            'unit_price': price,
                            'amount': round(quantity * price, 2)
                        }
                        current_quotation['services'].append(new_service)
                        current_quotation = QuotationManager.calculate_totals(current_quotation)
                        return f"I've added '{service_name}' with quantity {quantity} and price ₹{price:,.2f}.", current_quotation
            
            fallback_message += "Please specify both quantity and price, for example: 'Add [service] with quantity 5 and price 10000'"
        elif 'change' in user_lower and 'name' in user_lower:
            fallback_message += "Please try rephrasing your request, for example: 'Change [old name] to [new name]'"
        else:
            fallback_message += "Please try again or rephrase your request."
        
        return fallback_message, current_quotation


class QuotationManager:
    """Manager for quotation operations."""
    
    @staticmethod
    def initialize_quotation() -> Dict[str, Any]:
        """Initialize empty quotation structure."""
        return {
            "services": [],
            "subtotal": 0,
            "gst_percentage": 0,
            "gst_amount": 0,
            "grand_total": 0
        }
    
    @staticmethod
    def calculate_totals(quotation: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate subtotal, GST, and grand_total from services."""
        services = quotation.get("services", [])
        
        # Recalculate amounts for each service
        for service in services:
            # Support both unit_price and legacy fields (price/unit_rate) for backward compatibility
            unit_price = service.get("unit_price") or service.get("price") or service.get("unit_rate", 0)
            quantity = service.get("quantity", 0)
            
            # Ensure numeric types
            try:
                unit_price = float(unit_price) if unit_price else 0.0
                quantity = int(float(quantity)) if quantity else 0
            except (ValueError, TypeError):
                unit_price = 0.0
                quantity = 0
            
            # Ensure unit_price field exists
            if "unit_price" not in service:
                service["unit_price"] = unit_price
            
            # Calculate amount
            service["amount"] = round(unit_price * quantity, 2)
        
        # Calculate subtotal
        subtotal = sum(
            float(service.get("amount", 0) or 0)
            for service in services
        )
        
        quotation["subtotal"] = round(subtotal, 2)
        
        # Calculate GST
        gst_percentage = quotation.get("gst_percentage", 0)
        try:
            gst_percentage = float(gst_percentage) if gst_percentage else 0.0
        except (ValueError, TypeError):
            gst_percentage = 0.0
        
        # Set default GST to 18% if services exist and GST is 0
        if gst_percentage == 0 and len(services) > 0:
            # Check if user explicitly set GST to 0 (by checking if it was in the original)
            # For now, we'll keep it at 0 unless explicitly set
            pass
        
        quotation["gst_percentage"] = gst_percentage
        
        if gst_percentage > 0:
            gst_amount = (subtotal * gst_percentage) / 100
        else:
            gst_amount = 0
        
        quotation["gst_amount"] = round(gst_amount, 2)
        quotation["grand_total"] = round(subtotal + gst_amount, 2)
        
        return quotation
    
    @staticmethod
    def validate_quotation(quotation: Dict[str, Any]) -> bool:
        """Validate quotation structure."""
        if not isinstance(quotation, dict):
            return False
        
        if "services" not in quotation:
            return False
        
        if not isinstance(quotation["services"], list):
            return False
        
        # Validate each service
        for service in quotation["services"]:
            if not isinstance(service, dict):
                return False
            
            # Required fields
            if "service_name" not in service or not service["service_name"]:
                return False
            
            # Quantity must be present and numeric
            if "quantity" not in service:
                return False
            try:
                quantity = float(service["quantity"])
                if quantity < 0:
                    return False
            except (ValueError, TypeError):
                return False
            
            # Must have unit_price, price, or unit_rate (for backward compatibility)
            has_price = False
            if "unit_price" in service:
                try:
                    float(service["unit_price"])
                    has_price = True
                except (ValueError, TypeError):
                    pass
            if not has_price and "price" in service:
                try:
                    float(service["price"])
                    has_price = True
                except (ValueError, TypeError):
                    pass
            if not has_price and "unit_rate" in service:
                try:
                    float(service["unit_rate"])
                    has_price = True
                except (ValueError, TypeError):
                    pass
            
            if not has_price:
                return False
            
            # Amount should be present (will be recalculated if missing)
            if "amount" not in service:
                # This is OK, we'll recalculate it
                pass
        
        return True
    
    @staticmethod
    def normalize_quotation(quotation: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize quotation structure to ensure consistency."""
        if not isinstance(quotation, dict):
            quotation = QuotationManager.initialize_quotation()
        
        # Ensure services list exists
        if "services" not in quotation or not isinstance(quotation["services"], list):
            quotation["services"] = []
        
        # Normalize each service
        for service in quotation["services"]:
            if not isinstance(service, dict):
                continue
            
            # Ensure service_name is a string
            if "service_name" not in service or not service["service_name"]:
                service["service_name"] = "Unnamed Service"
            
            # Normalize price fields - ensure unit_price exists
            unit_price = service.get("unit_price") or service.get("price") or service.get("unit_rate", 0)
            try:
                unit_price = float(unit_price)
            except (ValueError, TypeError):
                unit_price = 0
            
            service["unit_price"] = unit_price
            # Keep backward compatibility
            if "price" not in service:
                service["price"] = unit_price
            if "unit_rate" not in service:
                service["unit_rate"] = unit_price
            
            # Normalize quantity
            quantity = service.get("quantity", 1)
            try:
                quantity = int(float(quantity))
                if quantity < 0:
                    quantity = 0
            except (ValueError, TypeError):
                quantity = 0
            service["quantity"] = quantity
            
            # Recalculate amount
            service["amount"] = round(unit_price * quantity, 2)
        
        # Ensure all required quotation fields exist
        if "subtotal" not in quotation:
            quotation["subtotal"] = 0
        if "gst_percentage" not in quotation:
            quotation["gst_percentage"] = 0
        if "gst_amount" not in quotation:
            quotation["gst_amount"] = 0
        if "grand_total" not in quotation:
            quotation["grand_total"] = 0
        
        # Recalculate totals
        quotation = QuotationManager.calculate_totals(quotation)
        
        return quotation

