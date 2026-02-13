import { quotationData } from "./quoteData";
import { Images } from "../../common/assets";
import { CONFIG } from "../../API/config";

const QuotationTemplate = ({ quotation, companyDetails, loading, selectedCustomer, viewMode, conversationHistory }) => {
  // Construct media URL helper function
  const constructMediaUrl = (relativeUrl) => {
    if (!relativeUrl ||
      relativeUrl === null ||
      relativeUrl === 'null' ||
      relativeUrl === undefined ||
      String(relativeUrl).trim() === '') {
      return null;
    }

    let url = String(relativeUrl).trim();

    // If already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Get base URL and remove /api if present (media files are served at root level, not under /api)
    let baseUrl = (CONFIG.BASE_URL || '').replace(/\/$/, '');
    // Remove /api from the end of base URL since media files are at root level
    baseUrl = baseUrl.replace(/\/api$/, '');

    // Ensure URL starts with /
    const mediaUrl = url.startsWith('/') ? url : `/${url}`;

    return `${baseUrl}${mediaUrl}`;
  };

  // Transform backend quotation to frontend format
  const transformQuotation = () => {
    // Get company info - always use company details from API
    const logoUrl = companyDetails?.quotation_logo_url
      ? constructMediaUrl(companyDetails.quotation_logo_url)
      : null;

    // Get login logo for footer
    const loginLogoUrl = companyDetails?.login_logo_url
      ? constructMediaUrl(companyDetails.login_logo_url)
      : null;

    const company = companyDetails ? {
      name: companyDetails.company_name || "",
      address: companyDetails.address || "",
      phone: companyDetails.phone_number || "",
      email: companyDetails.email || "",
      logo: logoUrl || Images.smLogo,
    } : {
      name: "",
      address: "",
      phone: "",
      email: "",
      logo: Images.smLogo,
    };

    // Transform services to items - only use actual quotation data
    const services = quotation?.services || [];
    const items = services.map(service => ({
      item: service.service_name || "Service",
      qty: service.quantity || 0,
      rate: service.unit_price || service.price || service.unit_rate || 0,
      key_features: service.key_features || [],
    }));

    // Get charges from quotation
    const charges = {
      shipping: quotation?.shipping || 0,
      gstPercent: quotation?.gst_percentage || 0,
    };

    // Calculate totals
    const subtotal = quotation?.subtotal || items.reduce(
      (acc, item) => acc + item.qty * item.rate,
      0
    );
    const gstAmount = quotation?.gst_amount || (subtotal * charges.gstPercent) / 100;
    const total = quotation?.grand_total || subtotal + charges.shipping + gstAmount;

    // Get date
    const date = quotation?.date || new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return {
      company,
      quotationInfo: {
        date,
        quotationNumber: quotation?.quotation_number || "",
      },
      quotationBy: companyDetails ? {
        name: companyDetails.company_name || "",
        address: companyDetails.address || "",
        phone: companyDetails.phone_number || "",
        email: companyDetails.email || "",
      } : (quotation?.quotation_by || {
        name: "",
        address: "",
        phone: "",
        email: "",
      }),
      quotationTo: selectedCustomer ? {
        name: selectedCustomer.customer_name || "",
        address: selectedCustomer.address || "",
        phone: selectedCustomer.phone_number || "",
        email: selectedCustomer.email || "",
      } : (quotation?.quotation_to || {
        name: "",
        address: "",
        phone: "",
        email: "",
      }),
      items: items, // Only use actual items from quotation, no default data
      charges,
      footer: {
        logo: loginLogoUrl || Images.fullLogo,
        website: companyDetails?.website || "",
      },
      subtotal,
      gstAmount,
      total,
    };
  };

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-xl overflow-hidden text-xs sm:text-sm p-8 sm:p-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-textSecondary font-medium">Loading quotation...</p>
        </div>
      </div>
    );
  }

  const data = transformQuotation();
  const { company, quotationInfo, quotationBy, quotationTo, items, charges, footer, subtotal, gstAmount, total } = data;

  // Show content: view mode = show when customer exists; else = show when services + customer
  const hasServices = items && items.length > 0 && items.some(item => item.item && item.qty > 0);
  const hasCustomer = selectedCustomer !== null || (quotation?.quotation_to && quotation.quotation_to?.name);
  const showFullContent = viewMode ? hasCustomer : (hasServices && hasCustomer);
  
  // Check if chat has started - header and footer should only show AFTER chat starts
  // Chat has started if there are conversation messages
  const hasChatStarted = conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0;
  
  // Check if quotation is empty (new user scenario - no services and no customer)
  // Hide header and footer when there's no meaningful content to display
  // First check if services array from quotation is empty
  const quotationServices = quotation?.services || [];
  const hasQuotationServices = Array.isArray(quotationServices) && quotationServices.length > 0;
  
  // Check for valid services - must have items with actual values (not just "Service" placeholder)
  const hasValidServices = hasQuotationServices && items && Array.isArray(items) && items.length > 0 && 
    items.some(item => {
      if (!item || !item.item) return false;
      // Check if it's not just a placeholder "Service" text
      const isPlaceholder = item.item === "Service" || item.item.trim() === "";
      // Must have quantity > 0 or rate > 0, and not be a placeholder
      return !isPlaceholder && (item.qty > 0 || item.rate > 0);
    });
  
  // Check for valid customer - must have actual customer data
  const hasValidCustomer = (selectedCustomer !== null && selectedCustomer.customer_name && selectedCustomer.customer_name.trim() !== '') || 
    (quotation?.quotation_to && quotation.quotation_to?.name && quotation.quotation_to.name.trim() !== '');
  
  // Hide header and footer when:
  // 1. NOT in viewMode (not viewing from customer tab) AND chat hasn't started yet (no conversation history), OR
  // 2. NOT in viewMode AND no valid services AND no valid customer (empty quotation)
  // When viewing from customer tab (viewMode=true), always show header and footer
  // Initial preview should be completely empty until chat starts (only for new quotations)
  const isEmptyQuotation = !viewMode && ((!hasChatStarted) || (!hasValidServices && !hasValidCustomer));

  return (
    <div
      id="quotation-preview"
      className="bg-white text-sm mx-auto flex flex-col relative shadow-lg rounded-lg overflow-hidden"
      style={{
        minHeight: 'auto',
        backgroundColor: '#ffffff',
        position: 'relative'
      }}
    >

      {/* ===== HEADER ===== - Hide when quotation is empty */}
      {!isEmptyQuotation && (
      <div className="bg-gradient-to-r from-[#DEDFE6] to-[#E8E9F0] p-4 sm:p-5 md:p-8 border-b-2 border-primary/10 shadow-sm">

        <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-6 md:gap-0">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-lg blur-sm"></div>
              <img
                src={company.logo}
                alt="logo"
                className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain shrink-0 bg-white rounded-lg p-1.5 shadow-md"
                onError={(e) => {
                  e.target.src = Images.smLogo;
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight break-words text-textPrimary tracking-tight">
                {company.name}
              </h2>
              <p className="text-textSecondary text-xs sm:text-sm mt-1.5 break-words font-medium">
                {company.email}
              </p>
            </div>
          </div>

          {/* RIGHT SIDE - QUOT_NO is permanent (not editable) once created from customer tab */}
          <div className="text-left md:text-right mt-4 md:mt-0">
            <div className="inline-block bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2.5 shadow-sm border border-primary/10">
              <p className="font-bold text-sm sm:text-base mb-1.5 text-primary break-words" title="Quotation number is permanent and cannot be changed">
                Quotation #: <span className="text-textPrimary">{quotationInfo.quotationNumber || "—"}</span>
              </p>
              <p className="font-medium text-xs sm:text-sm text-textSecondary">{quotationInfo.date}</p>
            </div>
          </div>

        </div>

      </div>
      )}


      {/* ===== BILLING SECTION - Only show if customer is selected ===== */}
      {showFullContent && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 p-4 sm:p-5 md:p-8 gap-6 md:gap-8 bg-gradient-to-b from-white to-gray-50/30">

            {/* Left Side - Quotation By (Company Details) */}
            <div className="text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h4 className="font-bold text-textPrimary text-sm sm:text-base uppercase tracking-wide">
                  Quotation By
                </h4>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-lineColor/50 space-y-2">
                {quotationBy.name && (
                  <p className="text-sm sm:text-base text-textPrimary font-bold mb-2 break-words">{quotationBy.name}</p>
                )}
                {quotationBy.address && (
                  <p className="text-xs sm:text-sm text-textSecondary font-normal mb-1.5 break-words leading-relaxed">{quotationBy.address}</p>
                )}
                {quotationBy.phone && (
                  <p className="text-xs sm:text-sm text-textSecondary font-normal mb-1.5 break-words">{quotationBy.phone}</p>
                )}
                {quotationBy.email && (
                  <p className="text-xs sm:text-sm text-primary font-medium break-words">
                    {quotationBy.email}
                  </p>
                )}
              </div>
            </div>

            {/* Right Side - Quotation To (Customer Details) */}
            <div className="text-left md:text-right mt-4 md:mt-0">
              <div className="flex items-center gap-2 mb-4 md:justify-end">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                <h4 className="font-bold text-textPrimary text-sm sm:text-base uppercase tracking-wide">
                  Quotation To
                </h4>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-lineColor/50 space-y-2">
                {quotationTo.name && (
                  <p className="text-sm sm:text-base text-textPrimary font-bold mb-2 break-words">{quotationTo.name}</p>
                )}
                {quotationTo.address && (
                  <p className="text-xs sm:text-sm text-textSecondary font-normal mb-1.5 break-words leading-relaxed">{quotationTo.address}</p>
                )}
                {quotationTo.phone && (
                  <p className="text-xs sm:text-sm text-textSecondary font-normal mb-1.5 break-words">{quotationTo.phone}</p>
                )}
                {quotationTo.email && (
                  <p className="text-xs sm:text-sm text-primary font-medium break-words">
                    {quotationTo.email}
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* ===== TABLE SECTION ===== */}
          <div className="p-4 sm:p-5 md:p-8">
            {/* ===== TABLE ===== */}
            <div className="overflow-x-auto rounded-lg border border-lineColor/50 shadow-sm bg-white">
              <div className="min-w-full inline-block align-middle">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-primary to-primary/90">
                      <th className="p-3 sm:p-4 text-left text-white text-xs sm:text-sm font-bold uppercase tracking-wide">Service Name</th>
                      <th className="p-3 sm:p-4 text-center text-white text-xs sm:text-sm font-bold uppercase tracking-wide">Quantity</th>
                      <th className="p-3 sm:p-4 text-center text-white text-xs sm:text-sm font-bold uppercase tracking-wide">Price</th>
                      <th className="p-3 sm:p-4 text-right text-white text-xs sm:text-sm font-bold uppercase tracking-wide">Amount (₹)</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-lineColor/30">
                    {items.length > 0 ? (
                      items.map((item, index) => (
                        <tr 
                          key={index} 
                          className="transition-colors hover:bg-primary/5 even:bg-gray-50/30"
                        >
                          <td className="p-3 sm:p-4 break-words font-medium text-textPrimary">{item.item}</td>
                          <td className="p-3 sm:p-4 text-center font-semibold text-textPrimary">{item.qty}</td>
                          <td className="p-3 sm:p-4 text-center font-semibold text-textPrimary">₹{item.rate.toLocaleString('en-IN')}</td>
                          <td className="p-3 sm:p-4 text-right font-bold text-primary">
                            ₹{(item.qty * item.rate).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-textSecondary text-sm">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="font-medium">No items added yet</p>
                            <p className="text-xs text-textSecondary mt-1">Add services to create your quotation</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ===== TOTAL SECTION ===== */}
            <div className="flex justify-end mt-6">
              <div className="w-full sm:w-auto sm:min-w-[280px] md:min-w-[320px] bg-gradient-to-br from-gray-50 to-white rounded-lg border-2 border-primary/20 shadow-md p-5 space-y-3">

                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-textSecondary font-medium">Subtotal</span>
                  <span className="text-textPrimary font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-textSecondary font-medium">Shipping</span>
                  <span className="text-textPrimary font-semibold">₹{charges.shipping.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-textSecondary font-medium">GST ({charges.gstPercent}%)</span>
                  <span className="text-textPrimary font-semibold">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="border-t-2 border-primary/30 pt-3 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-bold text-textPrimary uppercase tracking-wide">Total</span>
                    <span className="text-xl sm:text-2xl font-bold text-primary">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* ===== KEY FEATURES SUMMARY (ONE LINE PER SERVICE) ===== */}
            {items.some(item => item.key_features && item.key_features.some(f => f && f.trim())) && (
              <div className="mt-6 sm:mt-8 pt-6 border-t-2 border-lineColor/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-primary rounded-full"></div>
                  <h4 className="text-sm sm:text-base font-bold text-textPrimary uppercase tracking-wide">
                    Key Features
                  </h4>
                </div>
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 sm:p-5 border border-primary/20 space-y-3">
                  {items.map((item, index) => {
                    const features = (item.key_features || []).filter(f => f && f.trim());
                    if (features.length === 0) return null;
                    return (
                      <div key={index} className="bg-white rounded-md p-3 shadow-sm border border-lineColor/30">
                        <p className="text-sm font-bold text-primary mb-1.5">{item.item}</p>
                        <p className="text-xs sm:text-sm text-textSecondary leading-relaxed break-words">
                          {features.join(" • ")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}


      {/* ===== FOOTER ===== - Hide when quotation is empty */}
      {!isEmptyQuotation && (
      <div
        className="p-4 sm:p-5 md:p-8 bg-gradient-to-r from-[#DEDFE6] to-[#E8E9F0] text-center border-t-2 border-primary/10 shadow-inner"
        style={{
          marginTop: showFullContent ? 'auto' : '0',
          width: '100%',
        }}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm inline-block">
            <img
              src={footer.logo}
              alt="footer logo"
              className="w-28 sm:w-32 md:w-40 h-auto mx-auto object-contain"
              onError={(e) => { e.target.src = Images.fullLogo; }}
            />
          </div>
          {footer.website && (
            <p className="text-primary text-sm sm:text-base font-semibold break-words px-2 hover:text-primary/80 transition-colors">
              {footer.website}
            </p>
          )}
        </div>
      </div>
      )}



    </div>
  );
};

export default QuotationTemplate;
