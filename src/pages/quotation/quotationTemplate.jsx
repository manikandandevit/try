import { quotationData } from "./quoteData";
import { Images } from "../../common/assets";
import { CONFIG } from "../../API/config";

const QuotationTemplate = ({ quotation, companyDetails, loading, selectedCustomer }) => {
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

    // Generate quotation number and date
    const quotationNo = quotation?.quotation_number || `QUO${Date.now().toString().slice(-6)}`;
    const date = quotation?.date || new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return {
      company,
      quotationInfo: {
        date,
        quotationNo,
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
      <div className="bg-white shadow rounded-xl overflow-hidden text-sm p-6 text-center">
        <p className="text-gray-500">Loading quotation...</p>
      </div>
    );
  }

  const data = transformQuotation();
  const { company, quotationInfo, quotationBy, quotationTo, items, charges, footer, subtotal, gstAmount, total } = data;
  
  // Show content only if services/items are added (not just customer selection)
  const hasServices = items && items.length > 0 && items.some(item => item.item && item.qty > 0);
  const showFullContent = hasServices && selectedCustomer !== null;

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden text-sm">

      {/* ===== HEADER ===== */}
      <div className="bg-[#DEDFE6] p-6">

        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
            <img 
              src={company.logo} 
              alt="logo" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.target.src = Images.smLogo;
              }}
            />
            <div>
              <h2 className="text-xl font-bold">{company.name}</h2>
              <p className="text-gray-500 text-sm font-normal mt-1">
                {company.email}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-normal text-sm mb-1">{quotationInfo.date}</p>
            <p className="font-semibold text-base text-textPrimary mb-1">Quotation No</p>
            <p className="text-primary font-bold">
              {quotationInfo.quotationNo}
            </p>
          </div>
        </div>

      </div>

      {/* ===== BILLING SECTION - Only show if customer is selected ===== */}
      {showFullContent && (
        <>
          <div className="flex justify-between p-6">

            {/* Left Side - Quotation By (Company Details) */}
            <div className="text-left">
              <h4 className="font-semibold text-textSecondary text-sm mb-2">
                Quotation By
              </h4>

              {quotationBy.name && (
                <p className="text-sm text-textPrimary font-semibold mb-1">{quotationBy.name}</p>
              )}
              {quotationBy.address && (
                <p className="text-sm text-textPrimary font-normal mb-1">{quotationBy.address}</p>
              )}
              {quotationBy.phone && (
                <p className="text-sm text-textPrimary font-normal mb-1">{quotationBy.phone}</p>
              )}
              {quotationBy.email && (
                <p className="text-sm text-textPrimary font-normal">
                  {quotationBy.email}
                </p>
              )}
            </div>

            {/* Right Side - Quotation To (Customer Details) */}
            <div className="text-right">
              <h4 className="font-semibold text-textSecondary text-sm mb-2">
                Quotation To
              </h4>

              {quotationTo.name && (
                <p className="text-sm text-textPrimary font-semibold mb-1">{quotationTo.name}</p>
              )}
              {quotationTo.address && (
                <p className="text-sm text-textPrimary font-normal mb-1">{quotationTo.address}</p>
              )}
              {quotationTo.phone && (
                <p className="text-sm text-textPrimary font-normal mb-1">{quotationTo.phone}</p>
              )}
              {quotationTo.email && (
                <p className="text-sm text-textPrimary font-normal">
                  {quotationTo.email}
                </p>
              )}
            </div>

          </div>

          {/* ===== TABLE ===== */}
          <div className="p-6">
            <table className="w-full text-sm border-b border-lineColor">
              <thead className="bg-primary">
                <tr>
                  <th className="p-2 text-left text-white">Service Name</th>
                  <th className="p-2 text-white">Quantity</th>
                  <th className="p-2 text-white">Price</th>
                  <th className="p-2 text-right text-white">Amount(₹)</th>
                </tr>
              </thead>

              <tbody>
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2">{item.item}</td>
                      <td className="p-2 text-center">{item.qty}</td>
                      <td className="p-2 text-center">{item.rate}</td>
                      <td className="p-2 text-right">
                        {item.qty * item.rate}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-400">
                      No items added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ===== TOTAL SECTION ===== */}
            <div className="flex justify-end mt-4">
              <div className="w-65 space-y-3">

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{charges.shipping}</span>
                </div>

                <div className="flex justify-between">
                  <span>GST ({charges.gstPercent}%)</span>
                  <span>{gstAmount}</span>
                </div>

                <div className="flex justify-between font-bold text-base border-t border-lineColor pt-2">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>

              </div>
            </div>

            {/* ===== KEY FEATURES SUMMARY (ONE LINE PER SERVICE) ===== */}
            {items.some(item => item.key_features && item.key_features.some(f => f && f.trim())) && (
              <div className="mt-6 border-t border-lineColor pt-4">
                <h4 className="text-sm font-semibold text-textPrimary mb-2">
                  Key Features
                </h4>
                <div className="space-y-1 text-xs text-gray-700">
                  {items.map((item, index) => {
                    const features = (item.key_features || []).filter(f => f && f.trim());
                    if (features.length === 0) return null;
                    return (
                      <p key={index}>
                        <span className="font-semibold">{item.item}:</span>{" "}
                        {features.join(", ")}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </>
      )}

      {/* ===== FOOTER ===== */}
      <div className="quotation-footer p-6 bg-[#DEDFE6] text-center">
        <img 
          src={footer.logo} 
          alt="footer logo" 
          className="w-35 h-10 mx-auto mb-2 object-contain"
          onError={(e) => {
            e.target.src = Images.fullLogo;
          }}
        />
        <p className="text-primary text-sm">{footer.website}</p>
      </div>

    </div>
  );
};

export default QuotationTemplate;
