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
      <div className="bg-gray-100 p-6">

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={company.logo} alt="logo" className="w-12 h-12" />
            <div>
              <h2 className="text-xl font-bold">{company.name}</h2>
              <p className="text-gray-500 text-xs">
                {company.address} | {company.phone} | {company.email}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p>Date: {quotationInfo.date}</p>
            <p className="font-semibold mt-1">Quotation No</p>
            <p className="text-primary font-bold">
              {quotationInfo.quotationNo}
            </p>
          </div>
        </div>

      </div>

      {/* ===== BILLING SECTION ===== */}
      <div className="grid grid-cols-2 gap-8 p-6 border-b">

        <div>
          <h4 className="font-semibold mb-2">Quotation By</h4>
          <p>{quotationBy.name}</p>
          <p>{quotationBy.place}</p>
          <p>{quotationBy.district}</p>
          <p>{quotationBy.phone}</p>
          <p>GST: {quotationBy.gst}</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Quotation To</h4>
          <p>{quotationTo.name}</p>
          <p>{quotationTo.place}</p>
          <p>{quotationTo.district}</p>
          <p>{quotationTo.phone}</p>
          <p>GST: {quotationTo.gst}</p>
        </div>

      </div>

      {/* ===== TABLE ===== */}
      <div className="p-6">

        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Item Details</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Rate</th>
              <th className="border p-2">Amount</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item.item}</td>
                <td className="border p-2 text-center">{item.qty}</td>
                <td className="border p-2 text-center">₹{item.rate}</td>
                <td className="border p-2 text-right">
                  ₹{item.qty * item.rate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== TOTAL SECTION ===== */}
        <div className="flex justify-end mt-6">
          <div className="w-64 space-y-2">

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>₹{charges.shipping}</span>
            </div>

            <div className="flex justify-between">
              <span>GST ({charges.gstPercent}%)</span>
              <span>₹{gstAmount}</span>
            </div>

            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

          </div>
        </div>

      </div>

      {/* ===== FOOTER ===== */}
      <div className="border-t p-6 text-center">
        <img src={footer.logo} alt="footer logo" className="w-10 mx-auto mb-2" />
        <p className="text-gray-500 text-xs">{footer.website}</p>
      </div>

    </div>
  );
};

export default QuotationTemplate;
