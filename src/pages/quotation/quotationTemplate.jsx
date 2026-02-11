import { quotationData } from "./quoteData";

const QuotationTemplate = () => {
  const { company, quotationInfo, quotationBy, quotationTo, items, charges, footer } =
    quotationData;

  const subtotal = items.reduce(
    (acc, item) => acc + item.qty * item.rate,
    0
  );

  const gstAmount = (subtotal * charges.gstPercent) / 100;
  const total = subtotal + charges.shipping + gstAmount;

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden text-sm">

      {/* ===== HEADER ===== */}
      <div className="bg-[#DEDFE6] p-6">

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={company.logo} alt="logo" className="w-12 h-12" />
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

      {/* ===== BILLING SECTION ===== */}
      <div className="flex justify-between p-6">

        {/* Left Side */}
        <div className="text-left">
          <h4 className="font-semibold text-textSecondary text-sm mb-2">
            Quotation By
          </h4>

          <p className="text-sm text-textPrimary font-semibold mb-1">{quotationBy.name}</p>
          <p className="text-sm text-textPrimary font-normal mb-1">{quotationBy.place}</p>
          <p className="text-sm text-textPrimary font-normal mb-1">{quotationBy.district}</p>
          <p className="text-sm text-textPrimary font-normal mb-1">{quotationBy.phone}</p>
          <p className="text-sm text-textPrimary font-normal">
            GST: {quotationBy.gst}
          </p>
        </div>

        {/* Right Side */}
        <div className="text-right">
          <h4 className="font-semibold text-textSecondary text-sm mb-2">
            Quotation To
          </h4>

          <p className="text-sm text-textPrimary font-semibold mb-1">{quotationTo.name}</p>
          <p className="text-sm text-textPrimary font-normal mb-1">{quotationTo.place}</p>
          <p className="text-sm text-textPrimary font-normal mb-1">{quotationTo.district}</p>
          <p className="text-sm text-textPrimary font-normal mb-1">{quotationTo.phone}</p>
          <p className="text-sm text-textPrimary font-normal">
            GST: {quotationTo.gst}
          </p>
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
            {items.map((item, index) => (
              <tr key={index}>
                <td className="p-2">{item.item}</td>
                <td className="p-2 text-center">{item.qty}</td>
                <td className="p-2 text-center">{item.rate}</td>
                <td className="p-2 text-right">
                  {item.qty * item.rate}
                </td>
              </tr>
            ))}
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

      </div>

      {/* ===== FOOTER ===== */}
      <div className="p-6 bg-[#DEDFE6] text-center">
        <img src={footer.logo} alt="footer logo" className="w-35 h-10 mx-auto mb-2" />
        <p className="text-primary text-sm">{footer.website}</p>
      </div>

    </div>
  );
};

export default QuotationTemplate;
