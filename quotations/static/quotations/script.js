// KATTAPPA AI Quotation Maker - Frontend JavaScript

class KattappaApp {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.savePdfBtn = document.getElementById('savePdfBtn');
        this.quotationPreview = document.getElementById('quotationPreview');
        
        // Store current quotation in memory for instant updates
        this.currentQuotation = null;
        
        // Store company info for header
        this.companyInfo = null;
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.resetBtn.addEventListener('click', () => this.resetQuotation());
        this.savePdfBtn.addEventListener('click', () => this.downloadPdf());
        
        // Load company info and existing quotation from session
        this.loadCompanyInfo();
        this.loadQuotation();
        
        // Focus input
        this.messageInput.focus();
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // Disable input while processing
        this.setLoading(true);
        
        // Add user message to chat
        this.addMessage('user', message);
        
        // Clear input
        this.messageInput.value = '';
        
        // Try to update preview instantly for simple changes
        const instantUpdate = this.tryInstantUpdate(message);
        
        try {
            const response = await fetch('/api/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({ message: message })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Add AI response to chat
                this.addMessage('assistant', data.response);
                
                // Merge server response with instant update (prefer instant update if it happened)
                if (instantUpdate && this.currentQuotation) {
                    // Keep the instant update, but merge with server response to avoid duplicates
                    const serverQuotation = data.quotation;
                    if (serverQuotation && serverQuotation.services) {
                        // First, clean up invalid services (those with quantity/price keywords in name)
                        this.currentQuotation.services = this.currentQuotation.services.filter(service => {
                            const name = service.service_name.toLowerCase();
                            // Remove services that have quantity/price keywords in the name (invalid parsing)
                            return !name.match(/\b(?:quantity|qty|price|rate)\s+\d+/);
                        });
                        
                        // Merge services: avoid duplicates by name
                        const existingServiceNames = new Set(
                            this.currentQuotation.services.map(s => s.service_name.toLowerCase())
                        );
                        
                        // Add services from server that don't exist in our instant update
                        for (let serverService of serverQuotation.services) {
                            const serverServiceName = serverService.service_name.toLowerCase();
                            
                            // Skip invalid services from server too
                            if (serverServiceName.match(/\b(?:quantity|qty|price|rate)\s+\d+/)) {
                                continue;
                            }
                            
                            if (!existingServiceNames.has(serverServiceName)) {
                                this.currentQuotation.services.push(serverService);
                                existingServiceNames.add(serverServiceName);
                            } else {
                                // Update existing service with server's data (prefer server data if it has valid values)
                                const existingIndex = this.currentQuotation.services.findIndex(
                                    s => s.service_name.toLowerCase() === serverServiceName
                                );
                                if (existingIndex !== -1) {
                                    const existingService = this.currentQuotation.services[existingIndex];
                                    const serverPrice = serverService.unit_price || serverService.price || serverService.unit_rate || 0;
                                    const existingPrice = existingService.unit_price || existingService.price || existingService.unit_rate || 0;
                                    
                                    // Prefer server data if it has valid quantity and price
                                    if (serverService.quantity > 0 && serverPrice > 0) {
                                        // Use server's data (it's more accurate from AI)
                                        this.currentQuotation.services[existingIndex] = serverService;
                                    } else if (existingPrice > 0 && serverPrice === 0) {
                                        // Keep existing if it has valid data and server doesn't
                                        // (no change needed)
                                    }
                                }
                            }
                        }
                        
                        // Use server's calculated totals (more accurate)
                        this.currentQuotation.subtotal = serverQuotation.subtotal || this.currentQuotation.subtotal;
                        this.currentQuotation.gst_percentage = serverQuotation.gst_percentage || this.currentQuotation.gst_percentage;
                        this.currentQuotation.gst_amount = serverQuotation.gst_amount || this.currentQuotation.gst_amount;
                        this.currentQuotation.grand_total = serverQuotation.grand_total || this.currentQuotation.grand_total;
                        
                        // Recalculate to ensure consistency
                        this.recalculateTotals();
                    }
                } else {
                    // No instant update, use server response
                    // But still clean up invalid services
                    if (data.quotation && data.quotation.services) {
                        data.quotation.services = data.quotation.services.filter(service => {
                            const name = service.service_name.toLowerCase();
                            return !name.match(/\b(?:quantity|qty|price|rate)\s+\d+/);
                        });
                    }
                    this.currentQuotation = data.quotation;
                }
                this.updateQuotationPreview(this.currentQuotation);
            } else {
                // If instant update was done, revert it on error
                if (instantUpdate && this.currentQuotation) {
                    this.loadQuotation(); // Reload from server
                }
                this.addMessage('assistant', `Error: ${data.error || 'Something went wrong'}`);
            }
        } catch (error) {
            // If instant update was done, revert it on error
            if (instantUpdate && this.currentQuotation) {
                this.loadQuotation(); // Reload from server
            }
            this.addMessage('assistant', `Error: ${error.message}`);
        } finally {
            this.setLoading(false);
        }
    }
    
    tryInstantUpdate(message) {
        // Initialize quotation if it doesn't exist
        if (!this.currentQuotation) {
            this.currentQuotation = {
                services: [],
                subtotal: 0,
                gst_percentage: 0,
                gst_amount: 0,
                grand_total: 0
            };
        }
        if (!this.currentQuotation.services) {
            this.currentQuotation.services = [];
        }
        
        const lowerMessage = message.toLowerCase().trim();
        let updated = false;
        
        // IMPORTANT: Check for detailed patterns FIRST (with quantity and price)
        // This prevents the simple "add service" pattern from matching first and creating duplicates
        
        // Pattern: "add X with quantity Y and price Z" or "add X quantity Y price Z"
        // Also handle: "add service X Quantity Y price Z" (case-insensitive)
        // Try multiple patterns to handle different word orders
        let addServiceWithDetailsMatch = null;
        const addPatterns = [
            // "add service X Quantity Y price Z" or "add service X quantity Y price Z"
            /add\s+service\s+(.+?)\s+(?:quantity|qty)\s+(\d+)\s+(?:and\s+)?(?:price|rate)\s+(\d+(?:\.\d+)?)/i,
            // "add X Quantity Y price Z" or "add X quantity Y price Z"
            /add\s+(.+?)\s+(?:quantity|qty)\s+(\d+)\s+(?:and\s+)?(?:price|rate)\s+(\d+(?:\.\d+)?)/i,
            // "add X with quantity Y and price Z"
            /add\s+(?:service\s+)?(.+?)\s+with\s+(?:quantity|qty)\s+(\d+)\s+(?:and\s+)?(?:price|rate)\s+(\d+(?:\.\d+)?)/i,
            // "add X quantity Y price Z" (fallback)
            /add\s+(?:service\s+)?(.+?)\s+(?:quantity|qty)\s+(\d+)\s+(?:and\s+)?(?:price|rate)\s+(\d+(?:\.\d+)?)/i
        ];
        
        for (let pattern of addPatterns) {
            addServiceWithDetailsMatch = message.match(pattern);
            if (addServiceWithDetailsMatch) {
                break;
            }
        }
        
        if (addServiceWithDetailsMatch) {
            let serviceName = addServiceWithDetailsMatch[1].trim();
            // Clean up service name - remove trailing "service" if present
            serviceName = serviceName.replace(/\s+service\s*$/i, '').trim();
            // Remove any trailing "quantity" or "qty" that might have been captured
            serviceName = serviceName.replace(/\s+(?:quantity|qty)\s*$/i, '').trim();
            const quantity = parseInt(addServiceWithDetailsMatch[2]);
            const price = parseFloat(addServiceWithDetailsMatch[3]);
            
            if (serviceName && serviceName.length > 0 && !isNaN(quantity) && !isNaN(price)) {
                const existingIndex = this.currentQuotation.services.findIndex(
                    s => s.service_name && s.service_name.toLowerCase() === serviceName.toLowerCase()
                );
                
                if (existingIndex === -1) {
                    const newService = {
                        service_name: serviceName,
                        quantity: quantity,
                        unit_price: price,
                        amount: this.round(quantity * price, 2)
                    };
                    this.currentQuotation.services.push(newService);
                    updated = true;
                } else {
                    // Update existing service
                    this.currentQuotation.services[existingIndex].quantity = quantity;
                    this.currentQuotation.services[existingIndex].unit_price = price;
                    this.currentQuotation.services[existingIndex].amount = this.round(quantity * price, 2);
                    updated = true;
                }
            }
        } else {
            // Only check simple "add service" pattern if detailed pattern didn't match
            // Pattern: "add service X" or "add X service" or "add X"
            // Handle: "add Payment Integration", "add Payment Integration service", "add service Payment Integration"
            let addServiceMatch = lowerMessage.match(/^add\s+service\s+(.+)$/);
            if (!addServiceMatch) {
                addServiceMatch = lowerMessage.match(/^add\s+(.+?)(?:\s+service)?$/);
            }
            if (addServiceMatch) {
                let serviceName = addServiceMatch[1].trim();
                // Remove trailing "service" if it was captured
                serviceName = serviceName.replace(/\s+service\s*$/i, '').trim();
                // Also check if it contains quantity/price keywords - if so, skip this pattern
                if (!serviceName.match(/\b(?:quantity|qty|price|rate)\b/i)) {
                    if (serviceName && serviceName.length > 0) {
                        // Check if service already exists
                        const existingIndex = this.currentQuotation.services.findIndex(
                            s => s.service_name && s.service_name.toLowerCase() === serviceName.toLowerCase()
                        );
                        
                        if (existingIndex === -1) {
                            // Add new service with default values
                            const newService = {
                                service_name: serviceName,
                                quantity: 1,
                                unit_price: 0,
                                amount: 0
                            };
                            this.currentQuotation.services.push(newService);
                            updated = true;
                        }
                    }
                }
            }
        }
        
        // Pattern: "change service name X to Y" or "change X service name to Y" or "change X to Y"
        // Also handle: "change existing service X to Y", "change the Service Name Vehicle to Website Service"
        let changeServiceNameMatch = null;
        
        // Try multiple patterns in order of specificity
        const patterns = [
            /change\s+(?:the\s+)?service\s+name\s+(.+?)\s+to\s+(.+)/i,  // "change service name X to Y"
            /change\s+(?:the\s+)?(.+?)\s+service\s+name\s+to\s+(.+)/i,   // "change X service name to Y"
            /change\s+(?:existing\s+)?service\s+(.+?)\s+to\s+(.+)/i,     // "change service X to Y"
            /change\s+(?:the\s+)?(.+?)\s+to\s+(.+)/i,                    // "change X to Y" (most general)
            /rename\s+(?:the\s+)?(.+?)\s+(?:service\s+)?(?:to|into)\s+(.+)/i,  // "rename X to Y"
        ];
        
        for (let pattern of patterns) {
            changeServiceNameMatch = lowerMessage.match(pattern);
            if (changeServiceNameMatch) {
                break;
            }
        }
        
        if (changeServiceNameMatch && this.currentQuotation.services.length > 0) {
            let oldName = changeServiceNameMatch[1].trim();
            let newName = changeServiceNameMatch[2].trim();
            
            // Clean up names - remove "service" if present at the end
            oldName = oldName.replace(/\s+service\s*$/i, '').trim();
            newName = newName.replace(/\s+service\s*$/i, '').trim();
            
            // Skip if names are empty or same
            if (!oldName || !newName || oldName.toLowerCase() === newName.toLowerCase()) {
                // Don't update, but don't return false either
            } else {
                // Try to find service by name (case-insensitive, partial match)
                let found = false;
                for (let service of this.currentQuotation.services) {
                    if (service.service_name) {
                        const serviceNameLower = service.service_name.toLowerCase();
                        const oldNameLower = oldName.toLowerCase();
                        
                        // Check if old name matches service name (exact or contains)
                        if (serviceNameLower === oldNameLower || 
                            serviceNameLower.includes(oldNameLower) || 
                            oldNameLower.includes(serviceNameLower) ||
                            serviceNameLower.replace(/\s+service\s*$/i, '') === oldNameLower ||
                            oldNameLower.replace(/\s+service\s*$/i, '') === serviceNameLower) {
                            service.service_name = newName;
                            updated = true;
                            found = true;
                            break;
                        }
                    }
                }
                
                // If not found by exact/partial match, try to find by first word
                if (!found) {
                    const oldFirstWord = oldName.split(/\s+/)[0].toLowerCase();
                    for (let service of this.currentQuotation.services) {
                        if (service.service_name) {
                            const serviceFirstWord = service.service_name.split(/\s+/)[0].toLowerCase();
                            if (serviceFirstWord === oldFirstWord) {
                                service.service_name = newName;
                                updated = true;
                                break;
                            }
                        }
                    }
                }
            }
        }
        
        // Pattern: "change the Price amount X into Y" or "change price amount X to Y"
        const priceAmountMatch = lowerMessage.match(/change\s+(?:the\s+)?(?:price\s+)?amount\s+(\d+(?:\.\d+)?)\s+(?:into|to)\s+(\d+(?:\.\d+)?)/);
        if (priceAmountMatch && this.currentQuotation.services.length > 0) {
            const oldPrice = parseFloat(priceAmountMatch[1]);
            const newPrice = parseFloat(priceAmountMatch[2]);
            // Find service with matching price
            for (let service of this.currentQuotation.services) {
                const servicePrice = service.unit_price || service.price || service.unit_rate || 0;
                if (Math.abs(servicePrice - oldPrice) < 0.01) {
                    service.unit_price = newPrice;
                    service.price = newPrice; // For backward compatibility
                    service.unit_rate = newPrice; // For backward compatibility
                    service.amount = this.round(service.quantity * newPrice, 2);
                    updated = true;
                    break;
                }
            }
        }
        
        // Pattern: "change price to X" or "change rate to X"
        const priceMatch = lowerMessage.match(/change\s+(?:price|rate)\s+(?:to|to\s+)?(\d+(?:\.\d+)?)/);
        if (priceMatch && this.currentQuotation.services.length > 0) {
            const newPrice = parseFloat(priceMatch[1]);
            const service = this.currentQuotation.services[this.currentQuotation.services.length - 1];
            if (service) {
                service.unit_price = newPrice;
                service.price = newPrice; // For backward compatibility
                service.unit_rate = newPrice; // For backward compatibility
                service.amount = this.round(service.quantity * newPrice, 2);
                updated = true;
            }
        }
        
        // Pattern: "change the GST percentage X to Y" or "change GST percentage X to Y"
        const gstPercentageMatch = lowerMessage.match(/change\s+(?:the\s+)?gst\s+percentage\s+(\d+(?:\.\d+)?)\s+(?:to|into)\s+(\d+(?:\.\d+)?)/);
        if (gstPercentageMatch) {
            const oldGst = parseFloat(gstPercentageMatch[1]);
            const newGst = parseFloat(gstPercentageMatch[2]);
            // Check if current GST matches the old value (or just update if it's close)
            const currentGst = this.currentQuotation.gst_percentage || 0;
            if (Math.abs(currentGst - oldGst) < 0.01 || currentGst === 0) {
                this.currentQuotation.gst_percentage = newGst;
                updated = true;
            }
        }
        
        // Pattern: "change GST to X" or "change GST percentage to X"
        const gstMatch = lowerMessage.match(/change\s+(?:the\s+)?gst\s+(?:percentage\s+)?(?:to|to\s+)?(\d+(?:\.\d+)?)/);
        if (gstMatch) {
            const newGst = parseFloat(gstMatch[1]);
            this.currentQuotation.gst_percentage = newGst;
            updated = true;
        }
        
        const quantityMatch = lowerMessage.match(/change\s+quantity\s+(?:to|to\s+)?(\d+)/);
        if (quantityMatch && this.currentQuotation.services.length > 0) {
            const newQuantity = parseInt(quantityMatch[1]);
            const service = this.currentQuotation.services[this.currentQuotation.services.length - 1];
            if (service) {
                service.quantity = newQuantity;
                const price = service.unit_price || service.price || service.unit_rate || 0;
                service.amount = this.round(newQuantity * price, 2);
                updated = true;
            }
        }
        
        // Pattern: "remove X" or "delete X"
        // Also handle: "remove X quantity Y and price Z" - extract just the service name
        let removeMatch = null;
        // First try to match "remove X quantity Y price Z" pattern to extract service name
        const removeWithDetailsMatch = lowerMessage.match(/(?:remove|delete)\s+(.+?)\s+(?:quantity|qty)\s+\d+/);
        if (removeWithDetailsMatch) {
            // Extract service name before "quantity"
            let serviceNameToRemove = removeWithDetailsMatch[1].trim();
            // Clean up - remove trailing "works", "service" if present
            serviceNameToRemove = serviceNameToRemove.replace(/\s+(?:works?|service)\s*$/i, '').trim();
            
            if (serviceNameToRemove && this.currentQuotation.services.length > 0) {
                const index = this.currentQuotation.services.findIndex(
                    s => {
                        if (!s.service_name) return false;
                        const serviceNameLower = s.service_name.toLowerCase();
                        const toRemoveLower = serviceNameToRemove.toLowerCase();
                        // Check for exact match or if service name contains the to-remove name
                        return serviceNameLower === toRemoveLower || 
                               serviceNameLower.includes(toRemoveLower) ||
                               toRemoveLower.includes(serviceNameLower);
                    }
                );
                if (index !== -1) {
                    this.currentQuotation.services.splice(index, 1);
                    updated = true;
                }
            }
        } else {
            // Fallback to simple "remove X" pattern
            removeMatch = lowerMessage.match(/(?:remove|delete)\s+(.+)/);
            if (removeMatch && this.currentQuotation.services.length > 0) {
                let toRemove = removeMatch[1].trim();
                // Clean up - remove trailing quantity/price info if accidentally captured
                toRemove = toRemove.replace(/\s+(?:quantity|qty|price|rate).*$/i, '').trim();
                toRemove = toRemove.replace(/\s+(?:works?|service)\s*$/i, '').trim();
                
                const index = this.currentQuotation.services.findIndex(
                    s => {
                        if (!s.service_name) return false;
                        const serviceNameLower = s.service_name.toLowerCase();
                        const toRemoveLower = toRemove.toLowerCase();
                        return serviceNameLower === toRemoveLower || 
                               serviceNameLower.includes(toRemoveLower) ||
                               toRemoveLower.includes(serviceNameLower);
                    }
                );
                if (index !== -1) {
                    this.currentQuotation.services.splice(index, 1);
                    updated = true;
                }
            }
        }
        
        if (updated) {
            // Recalculate totals
            this.recalculateTotals();
            // Update preview instantly with animation
            this.updateQuotationPreview(this.currentQuotation);
            // Add visual feedback
            this.showPreviewUpdate();
            // Also sync to server immediately (fire and forget) to persist JSON state
            this.syncQuotationToServer();
            // Log for debugging (can be removed in production)
            console.log('Instant update applied:', JSON.stringify(this.currentQuotation, null, 2));
            return true;
        }
        
        return false;
    }
    
    async syncQuotationToServer() {
        // Sync the current quotation state to server in background
        // This ensures the JSON state is persisted even if AI response fails
        try {
            await fetch('/api/sync-quotation/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({ quotation: this.currentQuotation })
            });
        } catch (error) {
            // Silently fail - server will update when AI responds
            console.log('Background sync failed, will sync on AI response');
        }
    }
    
    recalculateTotals() {
        if (!this.currentQuotation) return;
        
        if (!this.currentQuotation.services || this.currentQuotation.services.length === 0) {
            this.currentQuotation.subtotal = 0;
            this.currentQuotation.gst_amount = 0;
            this.currentQuotation.grand_total = 0;
            return;
        }
        
        // Recalculate amounts for each service first
        this.currentQuotation.services.forEach(service => {
            const price = service.unit_price || service.price || service.unit_rate || 0;
            const quantity = service.quantity || 0;
            service.amount = this.round(price * quantity, 2);
        });
        
        // Calculate subtotal
        const subtotal = this.currentQuotation.services.reduce((sum, service) => {
            return sum + (parseFloat(service.amount) || 0);
        }, 0);
        
        this.currentQuotation.subtotal = this.round(subtotal, 2);
        
        // Calculate GST
        const gstPercentage = parseFloat(this.currentQuotation.gst_percentage) || 0;
        
        if (gstPercentage > 0) {
            this.currentQuotation.gst_amount = this.round((subtotal * gstPercentage) / 100, 2);
        } else {
            this.currentQuotation.gst_amount = 0;
        }
        
        // Calculate grand total
        this.currentQuotation.grand_total = this.round(subtotal + this.currentQuotation.gst_amount, 2);
    }
    
    addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString();
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    updateQuotationPreview(quotation) {
        // Store current quotation
        this.currentQuotation = quotation;
        
        // Show/hide Save button based on whether quotation has services
        if (quotation && quotation.services && quotation.services.length > 0) {
            this.savePdfBtn.style.display = 'block';
        } else {
            this.savePdfBtn.style.display = 'none';
        }
        
        if (!quotation || !quotation.services || quotation.services.length === 0) {
            this.quotationPreview.innerHTML = `
                <div class="empty-state">
                    <p>Start a conversation to create your quotation</p>
                </div>
            `;
            return;
        }
        
        // Build header HTML
        const company = this.companyInfo || {
            company_name: 'MAKLOGISTICS',
            tagline: 'DIGITAL SOLUTION ARCHITECTS',
            phone_number: '9042510714',
            email: 'maklogistics@gmail.com',
            address: 'TBI@TCE, Thiruparankundaram, Madurai – 625 015',
            logo_url: null
        };
        
        // Get current date in same format as PDF (matches Python's strftime("%d %b %Y"))
        const currentDate = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = String(currentDate.getDate()).padStart(2, '0');
        const formattedDate = `${day} ${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        
        let headerHTML = `
            <div class="preview-header-banner" style="width: 100%; min-width: 100%; background-color: #2563eb; padding: 15px 20px; color: white; margin: 0; left: 0; right: 0; box-sizing: border-box; position: relative;">
                <table class="preview-header-table" style="width: 100%; border-collapse: collapse; border-spacing: 0;">
                    <tr>
                        <td class="preview-header-logo" style="width: 90px; vertical-align: middle; padding-right: 10px;">
                            <div class="preview-logo-box" style="width: 65px; height: 65px; background: white; border-radius: 8px; padding: 2px; text-align: center;">
        `;
        
        if (company.logo_url) {
            headerHTML += `<img src="${this.escapeHtml(company.logo_url)}" class="preview-logo-img" style="width: 61px; height: 61px; max-width: 61px; max-height: 61px; min-width: 61px; min-height: 61px; object-fit: contain; display: block; opacity: 1;" crossorigin="anonymous" alt="Logo" loading="eager">`;
        }
        
        headerHTML += `
                            </div>
                        </td>
                        <td class="preview-header-company" style="padding-left: 10px; vertical-align: middle;">
                            <div class="preview-company-name" style="font-size: 18px; font-weight: bold; letter-spacing: 0.8px; margin-bottom: 2px; text-transform: uppercase; line-height: 1.2; color: white;">${this.escapeHtml(company.company_name)}</div>
                            <div class="preview-company-tagline" style="font-size: 9px; letter-spacing: 0.6px; margin-top: 1px; text-transform: uppercase; line-height: 1.3; color: white;">${this.escapeHtml(company.tagline)}</div>
                        </td>
                        <td class="preview-header-contact" style="text-align: right; font-size: 9px; line-height: 1.5; vertical-align: middle; padding-left: 15px;">
                            <div class="preview-contact-item" style="margin-bottom: 3px; color: white;">
                                <span>${this.escapeHtml(company.phone_number)}</span>
                            </div>
                            <div class="preview-contact-item" style="margin-bottom: 3px; color: white;">
                                <span>${this.escapeHtml(company.email)}</span>
                            </div>
                            <div class="preview-contact-item" style="margin-bottom: 3px; color: white;">
                                <span>${this.escapeHtml(company.address)}</span>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
            <div style="padding: 30px 30px 0 30px;">
                <p style="text-align:right; font-size:14px; margin: 0 0 20px 0; color: #000000; font-weight: 400;">
                    Date: ${formattedDate}
                </p>
            </div>
        `;
        
        // Build table HTML - EXACT same structure as PDF template
        let tableHTML = `
            <div class="quotation-table-container" style="margin-top: 0; padding: 30px; background: white;">
                <table class="quotation-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: white;">
                    <thead style="background-color: #667eea; color: white;">
                        <tr>
                            <th style="padding: 15px; text-align: left; font-weight: 600; font-size: 15px; color: white; background-color: #667eea;">Service Name</th>
                            <th style="padding: 15px; text-align: right; font-weight: 600; font-size: 15px; color: white; background-color: #667eea;">Quantity</th>
                            <th style="padding: 15px; text-align: right; font-weight: 600; font-size: 15px; color: white; background-color: #667eea;">Price (&#8377;)</th>
                            <th style="padding: 15px; text-align: right; font-weight: 600; font-size: 15px; color: white; background-color: #667eea;">Amount (&#8377;)</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        quotation.services.forEach(service => {
            // Support unit_price, price, and unit_rate for backward compatibility
            const price = service.unit_price || service.price || service.unit_rate || 0;
            tableHTML += `
                        <tr>
                            <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; font-size: 15px; color: #000000; font-weight: 400;">${this.escapeHtml(service.service_name)}</td>
                            <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; font-size: 15px; text-align: right; color: #000000; font-weight: 400;">${service.quantity}</td>
                            <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; font-size: 15px; text-align: right; color: #000000; font-weight: 400;">&#8377; ${this.formatNumber(price)}</td>
                            <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; font-size: 15px; text-align: right; color: #000000; font-weight: 400;">&#8377; ${this.formatNumber(service.amount)}</td>
                        </tr>
            `;
        });
        
        tableHTML += `
                    </tbody>
                </table>
                
                <div class="totals-section" style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                    <table class="totals-table" style="width: 100%; max-width: 400px; margin-left: auto; border-collapse: collapse;">
                        <tr>
                            <td class="label" style="padding: 10px 15px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: 600; font-size: 16px; color: #000000;">Subtotal:</td>
                            <td class="amount" style="padding: 10px 15px; border-bottom: 1px solid #e0e0e0; text-align: right; font-size: 17px; color: #000000; font-weight: 500;">&#8377; ${this.formatNumber(quotation.subtotal || 0)}</td>
                        </tr>
        `;
        
        // Add GST row if applicable (gst_percentage > 0)
        if (quotation.gst_percentage > 0) {
            tableHTML += `
                        <tr>
                            <td class="label" style="padding: 10px 15px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: 600; font-size: 16px; color: #000000;">GST (${quotation.gst_percentage}%):</td>
                            <td class="amount" style="padding: 10px 15px; border-bottom: 1px solid #e0e0e0; text-align: right; font-size: 17px; color: #000000; font-weight: 500;">&#8377; ${this.formatNumber(quotation.gst_amount || 0)}</td>
                        </tr>
            `;
        }
        
        tableHTML += `
                        <tr class="grand-total-row">
                            <td class="label" style="padding: 10px 15px; padding-top: 15px; border-top: 2px solid #000000; border-bottom: none; text-align: right; font-weight: bold; font-size: 20px; color: #000000;">Grand Total:</td>
                            <td class="amount" style="padding: 10px 15px; padding-top: 15px; border-top: 2px solid #000000; border-bottom: none; text-align: right; font-weight: bold; font-size: 20px; color: #000000;">&#8377; ${this.formatNumber(quotation.grand_total || 0)}</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="footer" style="margin-top: 40px; padding: 0 30px 20px 30px; text-align: left; font-size: 12px; color: #000000; font-weight: 400;">
                Generated by <b>KATTAPPA AI Quotation Maker</b>
            </div>
        `;
        
        // Add embedded CSS for PDF generation to ensure black text and full-bleed header
        const embeddedCSS = `
            <style>
                #quotation-preview {
                    margin: 0 !important;
                    padding: 0 !important;
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                }
                #quotation-preview * {
                    color: #000000 !important;
                }
                #quotation-preview .preview-header-banner {
                    width: 100% !important;
                    min-width: 100% !important;
                    max-width: 100% !important;
                    left: 0 !important;
                    right: 0 !important;
                    margin: 0 !important;
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                    padding: 15px 20px !important;
                    box-sizing: border-box !important;
                    position: relative !important;
                    display: block !important;
                }
                #quotation-preview .preview-header-banner *,
                #quotation-preview .quotation-table thead,
                #quotation-preview .quotation-table thead * {
                    color: white !important;
                }
                #quotation-preview .quotation-table td {
                    color: #000000 !important;
                    font-size: 15px !important;
                }
                #quotation-preview .totals-table .label,
                #quotation-preview .totals-table .amount {
                    color: #000000 !important;
                }
                #quotation-preview .grand-total-row .label,
                #quotation-preview .grand-total-row .amount {
                    color: #000000 !important;
                    font-weight: bold !important;
                }
                #quotation-preview .footer {
                    color: #000000 !important;
                }
            </style>
        `;
        
        // Wrap content in quotation-preview container for PDF generation with embedded CSS
        this.quotationPreview.innerHTML = `<div id="quotation-preview">${embeddedCSS}${headerHTML + tableHTML}</div>`;
        
        // Ensure logo images have proper attributes for PDF generation
        const logoImages = this.quotationPreview.querySelectorAll('.preview-logo-img');
        logoImages.forEach(img => {
            // Set CORS attribute
            img.crossOrigin = 'anonymous';
            
            // Ensure fixed dimensions for PDF rendering
            img.style.width = '61px';
            img.style.height = '61px';
            img.style.maxWidth = '61px';
            img.style.maxHeight = '61px';
            img.style.minWidth = '61px';
            img.style.minHeight = '61px';
            img.style.objectFit = 'contain';
            img.style.display = 'block';
            img.style.opacity = '1';
            img.style.visibility = 'visible';
            
            // Preload image to ensure it's ready for PDF generation
            if (!img.complete || img.naturalWidth === 0) {
                const newImg = new Image();
                newImg.crossOrigin = 'anonymous';
                newImg.src = img.src;
                // Wait for preload
                newImg.onload = () => {
                    console.log('Logo image preloaded successfully');
                };
                newImg.onerror = () => {
                    console.warn('Logo image preload failed:', img.src);
                };
            }
        });
        
        // Add fade-in animation for instant updates
        const container = this.quotationPreview.querySelector('.quotation-table-container');
        if (container) {
            container.style.animation = 'fadeIn 0.3s ease-in';
        }
    }
    
    async loadCompanyInfo() {
        try {
            const response = await fetch('/api/company-info/');
            const data = await response.json();
            
            if (response.ok) {
                this.companyInfo = data;
                // If quotation is already loaded, update preview to show header
                if (this.currentQuotation && this.currentQuotation.services && this.currentQuotation.services.length > 0) {
                    this.updateQuotationPreview(this.currentQuotation);
                }
            }
        } catch (error) {
            console.error('Error loading company info:', error);
        }
    }
    
    showPreviewUpdate() {
        // Add a subtle highlight effect to show instant update
        const container = this.quotationPreview.querySelector('.quotation-table-container');
        if (container) {
            container.style.transition = 'box-shadow 0.3s';
            container.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.5)';
            setTimeout(() => {
                if (container) {
                    container.style.boxShadow = '';
                }
            }, 500);
        }
    }
    
    async loadQuotation() {
        try {
            const response = await fetch('/api/quotation/');
            const data = await response.json();
            
            if (response.ok && data.quotation) {
                this.currentQuotation = data.quotation;
                this.updateQuotationPreview(data.quotation);
            }
        } catch (error) {
            console.error('Error loading quotation:', error);
        }
    }
    
    async resetQuotation() {
        if (!confirm('Are you sure you want to reset the quotation? This will clear all data.')) {
            return;
        }
        
        try {
            const response = await fetch('/api/reset/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Clear chat messages
                this.chatMessages.innerHTML = '';
                
                // Reset quotation preview
                this.updateQuotationPreview(data.quotation);
                
                // Add welcome message
                this.addMessage('assistant', 'Hello! I\'m KATTAPPA, your AI quotation assistant. How can I help you create a quotation today?');
            }
        } catch (error) {
            console.error('Error resetting quotation:', error);
            alert('Error resetting quotation: ' + error.message);
        }
    }
    
    setLoading(loading) {
        this.sendBtn.disabled = loading;
        this.messageInput.disabled = loading;
        
        if (loading) {
            this.sendBtn.innerHTML = '<span class="loading"></span>';
        } else {
            this.sendBtn.innerHTML = 'Send';
        }
    }
    
    getCsrfToken() {
        // Try to get from hidden input first
        const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfInput) {
            return csrfInput.value;
        }
        
        // Fallback to cookie
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return value;
            }
        }
        return '';
    }
    
    formatNumber(num) {
        return parseFloat(num).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    round(value, decimals) {
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
    
    // Helper function to load images and convert to base64 if needed
    async loadImageAsBase64(img) {
        return new Promise((resolve, reject) => {
            const originalSrc = img.src;
            
            // Always use fetch method for reliable base64 conversion
            // This works better with Django media files
            this.fetchImageAsBase64(originalSrc)
                .then(base64 => {
                    resolve(base64);
                })
                .catch(error => {
                    console.warn('Fetch method failed, trying canvas method:', error);
                    // Fallback to canvas method
                    this.convertImageToBase64WithCanvas(img)
                        .then(resolve)
                        .catch(reject);
                });
        });
    }
    
    // Canvas-based conversion (fallback)
    async convertImageToBase64WithCanvas(img) {
        return new Promise((resolve, reject) => {
            // Ensure CORS is set
            if (!img.crossOrigin || img.crossOrigin === '') {
                img.crossOrigin = 'anonymous';
            }
            
            // If image is already loaded
            if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    ctx.drawImage(img, 0, 0);
                    const dataURL = canvas.toDataURL('image/png');
                    resolve(dataURL);
                } catch (e) {
                    reject(new Error('Canvas conversion failed: ' + e.message));
                }
            } else {
                // Wait for image to load
                const originalSrc = img.src;
                img.crossOrigin = 'anonymous';
                
                const timeout = setTimeout(() => {
                    reject(new Error('Image load timeout'));
                }, 10000);
                
                img.onload = () => {
                    clearTimeout(timeout);
                    try {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        ctx.drawImage(img, 0, 0);
                        const dataURL = canvas.toDataURL('image/png');
                        resolve(dataURL);
                    } catch (e) {
                        reject(new Error('Canvas conversion failed: ' + e.message));
                    }
                };
                
                img.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error('Image failed to load'));
                };
                
                // Trigger reload if needed
                if (!img.complete) {
                    const src = img.src;
                    img.src = '';
                    img.src = src;
                }
            }
        });
    }
    
    // Fetch image and convert to base64 (PRIMARY METHOD - Most reliable)
    async fetchImageAsBase64(url) {
        try {
            // Handle relative URLs by making them absolute
            let absoluteUrl = url;
            if (url && !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
                // If it's a relative URL, make it absolute using current origin
                if (url.startsWith('/')) {
                    absoluteUrl = window.location.origin + url;
                } else {
                    absoluteUrl = window.location.origin + '/' + url;
                }
            }
            
            // If already base64, return as is
            if (absoluteUrl.startsWith('data:')) {
                return absoluteUrl;
            }
            
            console.log(`Fetching image from: ${absoluteUrl}`);
            const response = await fetch(absoluteUrl, {
                method: 'GET',
                credentials: 'same-origin', // Include cookies for Django authentication if needed
                cache: 'no-cache', // Ensure fresh fetch
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            }
            
            const blob = await response.blob();
            
            // Verify it's an image
            if (!blob.type.startsWith('image/')) {
                throw new Error(`Invalid image type: ${blob.type}`);
            }
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (reader.result) {
                        console.log('Image converted to Base64 successfully');
                        resolve(reader.result);
                    } else {
                        reject(new Error('FileReader returned empty result'));
                    }
                };
                reader.onerror = (error) => {
                    console.error('FileReader error:', error);
                    reject(new Error('FileReader failed: ' + error));
                };
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error fetching image:', error);
            throw error;
        }
    }
    
    async downloadPdf() {
        // Check if quotation exists and has services
        if (!this.currentQuotation || !this.currentQuotation.services || this.currentQuotation.services.length === 0) {
            alert('No quotation to download. Please create a quotation first.');
            return;
        }
        
        // Find the quotation preview container
        const previewElement = document.getElementById('quotation-preview');
        if (!previewElement) {
            alert('Quotation preview not found. Please refresh the page and try again.');
            return;
        }
        
        // CRITICAL: Remove all padding/margin from preview element BEFORE PDF generation
        const originalPreviewStyles = {
            margin: previewElement.style.margin || window.getComputedStyle(previewElement).margin,
            padding: previewElement.style.padding || window.getComputedStyle(previewElement).padding,
            paddingLeft: previewElement.style.paddingLeft || window.getComputedStyle(previewElement).paddingLeft,
            paddingRight: previewElement.style.paddingRight || window.getComputedStyle(previewElement).paddingRight,
        };
        
        previewElement.style.margin = '0';
        previewElement.style.padding = '0';
        previewElement.style.paddingLeft = '0';
        previewElement.style.paddingRight = '0';
        previewElement.style.setProperty('margin', '0', 'important');
        previewElement.style.setProperty('padding', '0', 'important');
        previewElement.style.setProperty('padding-left', '0', 'important');
        previewElement.style.setProperty('padding-right', '0', 'important');
        
        // Also ensure header has no left margin/padding constraints
        const headerElement = previewElement.querySelector('.preview-header-banner');
        let originalHeaderStyles = null;
        if (headerElement) {
            originalHeaderStyles = {
                marginLeft: headerElement.style.marginLeft || window.getComputedStyle(headerElement).marginLeft,
                left: headerElement.style.left || window.getComputedStyle(headerElement).left,
            };
            
            headerElement.style.marginLeft = '0';
            headerElement.style.left = '0';
            headerElement.style.setProperty('margin-left', '0', 'important');
            headerElement.style.setProperty('left', '0', 'important');
        }
        
        // Disable button while generating
        const originalText = this.savePdfBtn.innerHTML;
        this.savePdfBtn.disabled = true;
        this.savePdfBtn.innerHTML = '⏳ Generating...';
        
        try {
            // Check if html2pdf is available
            if (typeof html2pdf === 'undefined') {
                throw new Error('PDF library not loaded. Please refresh the page and try again.');
            }
            
            // Step 1: Wait for all images to be fully loaded before converting
            const images = previewElement.querySelectorAll('img');
            console.log(`Found ${images.length} image(s) to process for PDF`);
            
            if (images.length === 0) {
                console.warn('No images found in quotation preview');
            } else {
                // First, ensure all images are fully loaded
                console.log('Step 1a: Ensuring all images are fully loaded...');
                const loadPromises = Array.from(images).map((img, index) => {
                    return new Promise((resolve) => {
                        // Ensure CORS is set
                        img.crossOrigin = 'anonymous';
                        
                        // Ensure fixed dimensions
                        img.style.width = '61px';
                        img.style.height = '61px';
                        img.style.maxWidth = '61px';
                        img.style.maxHeight = '61px';
                        img.style.minWidth = '61px';
                        img.style.minHeight = '61px';
                        img.style.opacity = '1';
                        img.style.visibility = 'visible';
                        img.style.display = 'block';
                        
                        if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                            console.log(`✓ Image ${index + 1} already loaded (${img.naturalWidth}x${img.naturalHeight})`);
                            resolve();
                        } else {
                            const timeout = setTimeout(() => {
                                console.warn(`⏱ Image ${index + 1} load timeout, proceeding anyway`);
                                resolve();
                            }, 15000);
                            
                            img.onload = () => {
                                clearTimeout(timeout);
                                console.log(`✓ Image ${index + 1} loaded (${img.naturalWidth}x${img.naturalHeight})`);
                                resolve();
                            };
                            
                            img.onerror = () => {
                                clearTimeout(timeout);
                                console.warn(`⚠ Image ${index + 1} failed to load, will try base64 conversion anyway`);
                                resolve();
                            };
                            
                            // Trigger reload if needed
                            if (!img.complete) {
                                const src = img.src;
                                img.src = '';
                                img.src = src;
                            }
                        }
                    });
                });
                
                await Promise.all(loadPromises);
                console.log('✓ All images loaded');
                
                // Small delay to ensure DOM is updated
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Step 1b: Convert all images to Base64
                console.log('Step 1b: Converting images to Base64...');
                const imagePromises = Array.from(images).map((img, index) => {
                    const originalSrc = img.src;
                    console.log(`Processing image ${index + 1}/${images.length}: ${originalSrc.substring(0, 80)}...`);
                    
                    return this.loadImageAsBase64(img)
                        .then(base64 => {
                            console.log(`✓ Successfully converted image ${index + 1} to Base64 (${base64.length} chars)`);
                            // Update the image src to base64
                            img.src = base64;
                            img.crossOrigin = 'anonymous';
                            
                            // Ensure styles are still set
                            img.style.width = '61px';
                            img.style.height = '61px';
                            img.style.opacity = '1';
                            img.style.visibility = 'visible';
                            
                            // Verify the base64 image is valid
                            return new Promise((resolve) => {
                                const testImg = new Image();
                                testImg.crossOrigin = 'anonymous';
                                testImg.onload = () => {
                                    console.log(`✓ Image ${index + 1} base64 verified (${testImg.width}x${testImg.height})`);
                                    resolve();
                                };
                                testImg.onerror = () => {
                                    console.warn(`⚠ Image ${index + 1} base64 verification failed, but proceeding`);
                                    resolve(); // Continue anyway
                                };
                                testImg.src = base64;
                                
                                // Timeout after 2 seconds
                                setTimeout(() => {
                                    console.log(`⏱ Image ${index + 1} verification timeout, proceeding`);
                                    resolve();
                                }, 2000);
                            });
                        })
                        .catch(error => {
                            console.error(`✗ Failed to convert image ${index + 1}:`, error.message);
                            console.error(`  Original URL: ${originalSrc.substring(0, 100)}`);
                            // Don't throw - continue with original image
                            return Promise.resolve();
                        });
                });
                
                // Wait for all images to convert with timeout
                try {
                    await Promise.race([
                        Promise.all(imagePromises),
                        new Promise(resolve => {
                            setTimeout(() => {
                                console.warn('⏱ Image conversion timeout (15s), proceeding with PDF generation');
                                resolve();
                            }, 15000);
                        })
                    ]);
                    console.log('✓ All images converted to Base64');
                } catch (error) {
                    console.error('Error converting images:', error);
                }
                
                // Final delay to ensure base64 images are rendered
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Final verification
                const finalImages = previewElement.querySelectorAll('img');
                finalImages.forEach((img, idx) => {
                    if (img.src && img.src.startsWith('data:')) {
                        console.log(`✓ Image ${idx + 1} verified with base64 data URL`);
                    } else {
                        console.warn(`⚠ Image ${idx + 1} does not have base64 URL: ${img.src.substring(0, 50)}...`);
                    }
                });
            }
            
            // Step 2: Disable animations, opacity, transforms, filters before PDF generation
            const allElements = previewElement.querySelectorAll('*');
            const originalStyles = new Map();
            
            allElements.forEach(el => {
                const computedStyle = window.getComputedStyle(el);
                const original = {
                    opacity: el.style.opacity || computedStyle.opacity,
                    transform: el.style.transform || computedStyle.transform,
                    filter: el.style.filter || computedStyle.filter,
                    transition: el.style.transition || computedStyle.transition,
                    animation: el.style.animation || computedStyle.animation,
                };
                originalStyles.set(el, original);
                
                // Force full visibility
                el.style.opacity = '1';
                el.style.setProperty('opacity', '1', 'important');
                
                // Disable transforms that might cause rendering issues
                if (computedStyle.transform && computedStyle.transform !== 'none') {
                    el.style.transform = 'none';
                }
                
                // Disable filters
                if (computedStyle.filter && computedStyle.filter !== 'none') {
                    el.style.filter = 'none';
                }
                
                // Disable transitions and animations
                el.style.transition = 'none';
                el.style.animation = 'none';
                el.style.setProperty('transition', 'none', 'important');
                el.style.setProperty('animation', 'none', 'important');
            });
            
            // Small delay to ensure styles are applied
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Step 3: Configure PDF options with high quality settings
            const opt = {
                margin: [0, 0, 0, 0], // ZERO margins for full-bleed header
                filename: `quotation_${new Date().toISOString().slice(0, 10)}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    allowTaint: false,
                    letterRendering: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    removeContainer: true,
                    imageTimeout: 15000,
                    onclone: function(clonedDoc) {
                        // Remove all padding/margin from body and html for PDF
                        const clonedBody = clonedDoc.body;
                        const clonedHtml = clonedDoc.documentElement;
                        
                        if (clonedBody) {
                            clonedBody.style.margin = '0';
                            clonedBody.style.padding = '0';
                            clonedBody.style.setProperty('margin', '0', 'important');
                            clonedBody.style.setProperty('padding', '0', 'important');
                        }
                        
                        if (clonedHtml) {
                            clonedHtml.style.margin = '0';
                            clonedHtml.style.padding = '0';
                            clonedHtml.style.setProperty('margin', '0', 'important');
                            clonedHtml.style.setProperty('padding', '0', 'important');
                        }
                        
                        // Fix visibility in cloned document
                        const clonedPreview = clonedDoc.getElementById('quotation-preview');
                        if (clonedPreview) {
                            // Remove any padding/margin from preview container - CRITICAL for full-bleed
                            clonedPreview.style.margin = '0';
                            clonedPreview.style.padding = '0';
                            clonedPreview.style.paddingLeft = '0';
                            clonedPreview.style.paddingRight = '0';
                            clonedPreview.style.paddingTop = '0';
                            clonedPreview.style.paddingBottom = '0';
                            clonedPreview.style.setProperty('margin', '0', 'important');
                            clonedPreview.style.setProperty('padding', '0', 'important');
                            clonedPreview.style.setProperty('padding-left', '0', 'important');
                            clonedPreview.style.setProperty('padding-right', '0', 'important');
                            clonedPreview.style.width = '100%';
                            clonedPreview.style.setProperty('width', '100%', 'important');
                            
                            // Remove padding from all direct children that might constrain header
                            Array.from(clonedPreview.children).forEach(child => {
                                if (child.classList && !child.classList.contains('preview-header-banner')) {
                                    child.style.paddingLeft = '0';
                                    child.style.paddingRight = '0';
                                    child.style.setProperty('padding-left', '0', 'important');
                                    child.style.setProperty('padding-right', '0', 'important');
                                }
                            });
                            
                            // Find header banner and ensure full-bleed - break out of any container
                            const clonedHeader = clonedPreview.querySelector('.preview-header-banner');
                            if (clonedHeader) {
                                // Get any parent padding that might constrain the header
                                const parentPadding = window.getComputedStyle(clonedPreview).paddingLeft || '0px';
                                const paddingValue = parseFloat(parentPadding) || 0;
                                
                                // Use absolute positioning or negative margins to break out
                                clonedHeader.style.position = 'relative';
                                clonedHeader.style.width = '100vw';
                                clonedHeader.style.minWidth = '100%';
                                clonedHeader.style.left = paddingValue > 0 ? `-${paddingValue}px` : '0';
                                clonedHeader.style.right = '0';
                                clonedHeader.style.marginLeft = paddingValue > 0 ? `-${paddingValue}px` : '0';
                                clonedHeader.style.marginRight = '0';
                                clonedHeader.style.marginTop = '0';
                                clonedHeader.style.marginBottom = '0';
                                clonedHeader.style.padding = '15px 20px';
                                clonedHeader.style.boxSizing = 'border-box';
                                clonedHeader.style.setProperty('width', '100%', 'important');
                                clonedHeader.style.setProperty('min-width', '100%', 'important');
                                clonedHeader.style.setProperty('margin', '0', 'important');
                                clonedHeader.style.setProperty('margin-left', paddingValue > 0 ? `-${paddingValue}px` : '0', 'important');
                                clonedHeader.style.setProperty('left', '0', 'important');
                                clonedHeader.style.setProperty('right', '0', 'important');
                                
                                // Also ensure the parent has no padding that could constrain
                                clonedPreview.style.padding = '0';
                                clonedPreview.style.setProperty('padding', '0', 'important');
                                
                                // Check for any ancestor containers and remove their padding
                                let parent = clonedPreview.parentElement;
                                while (parent && parent !== clonedDoc.body) {
                                    const parentStyle = window.getComputedStyle(parent);
                                    if (parentStyle.paddingLeft !== '0px' || parentStyle.paddingRight !== '0px') {
                                        parent.style.paddingLeft = '0';
                                        parent.style.paddingRight = '0';
                                        parent.style.setProperty('padding-left', '0', 'important');
                                        parent.style.setProperty('padding-right', '0', 'important');
                                    }
                                    parent = parent.parentElement;
                                }
                            }
                            
                            const clonedElements = clonedPreview.querySelectorAll('*');
                            clonedElements.forEach(el => {
                                // Force opacity = 1 for all elements
                                el.style.opacity = '1';
                                el.style.setProperty('opacity', '1', 'important');
                                
                                // Disable animations and transitions
                                el.style.transition = 'none';
                                el.style.animation = 'none';
                                el.style.setProperty('transition', 'none', 'important');
                                el.style.setProperty('animation', 'none', 'important');
                                
                                // Disable transforms
                                if (el.style.transform && el.style.transform !== 'none') {
                                    el.style.transform = 'none';
                                }
                                
                                // Disable filters
                                if (el.style.filter && el.style.filter !== 'none') {
                                    el.style.filter = 'none';
                                }
                                
                                // Ensure images have CORS set and fixed dimensions
                                if (el.tagName === 'IMG') {
                                    el.crossOrigin = 'anonymous';
                                    // Ensure logo images have fixed dimensions
                                    if (el.classList.contains('preview-logo-img')) {
                                        el.style.width = '61px';
                                        el.style.height = '61px';
                                        el.style.maxWidth = '61px';
                                        el.style.maxHeight = '61px';
                                        el.style.minWidth = '61px';
                                        el.style.minHeight = '61px';
                                        el.style.objectFit = 'contain';
                                        el.style.display = 'block';
                                        el.style.opacity = '1';
                                        el.style.visibility = 'visible';
                                    }
                                }
                            });
                        }
                    }
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait' 
                }
            };
            
            // Step 4: Generate and download PDF from the exact preview DOM
            await html2pdf().set(opt).from(previewElement).save();
            
            // Step 5: Restore original styles after PDF generation
            originalStyles.forEach((original, el) => {
                if (original.opacity) el.style.opacity = original.opacity;
                if (original.transform) el.style.transform = original.transform;
                if (original.filter) el.style.filter = original.filter;
                if (original.transition) el.style.transition = original.transition;
                if (original.animation) el.style.animation = original.animation;
            });
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert(`Error generating PDF: ${error.message || 'Unknown error occurred'}`);
        } finally {
            // Restore original preview element styles
            if (originalPreviewStyles) {
                if (originalPreviewStyles.margin) previewElement.style.margin = originalPreviewStyles.margin;
                if (originalPreviewStyles.padding) previewElement.style.padding = originalPreviewStyles.padding;
                if (originalPreviewStyles.paddingLeft) previewElement.style.paddingLeft = originalPreviewStyles.paddingLeft;
                if (originalPreviewStyles.paddingRight) previewElement.style.paddingRight = originalPreviewStyles.paddingRight;
            }
            
            // Restore original header styles if they were modified
            if (headerElement && originalHeaderStyles) {
                if (originalHeaderStyles.marginLeft) headerElement.style.marginLeft = originalHeaderStyles.marginLeft;
                if (originalHeaderStyles.left) headerElement.style.left = originalHeaderStyles.left;
            }
            
            // Re-enable button
            this.savePdfBtn.disabled = false;
            this.savePdfBtn.innerHTML = originalText;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new KattappaApp();
    window.kattappaApp = app; // Store globally for debugging
    
    // Add welcome message after a short delay to ensure UI is ready
    setTimeout(() => {
        // Check if there are no messages yet
        if (app.chatMessages.children.length === 0) {
            app.addMessage('assistant', 'Hello! I\'m KATTAPPA, your AI quotation assistant. How can I help you create a quotation today?');
        }
    }, 300);
});

