import { useState, useEffect } from "react";
import { getDashboardCustomersApi } from "../../API/customerApi";

const RecentDetails = () => {
    const [customersData, setCustomersData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            try {
                const response = await getDashboardCustomersApi(20);
                if (response.success) {
                    const list = response.data?.customers ?? response.customers ?? [];
                    setCustomersData(Array.isArray(list) ? list : []);
                } else {
                    setCustomersData([]);
                }
            } catch (_) {
                setCustomersData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    if (loading) {
        return (
            <div className="w-full bg-white border border-lineColor rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 flex justify-center items-center min-h-[200px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-sm text-textSecondary">Loading...</p>
                </div>
            </div>
        );
    }

    if (!customersData.length) {
        return (
            <div className="w-full bg-white border border-lineColor rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 text-center text-gray-500 text-sm">
                <p>No customers found</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-white border border-lineColor rounded-lg sm:rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[600px]">
                    <thead className="text-gray-600 bg-[#DFEFFF] border-b border-gray-200">
                        <tr>
                            <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-semibold text-xs sm:text-sm">S. No</th>
                            <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-semibold text-xs sm:text-sm">Customer Name</th>
                            <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-semibold text-xs sm:text-sm hidden sm:table-cell">Company Name</th>
                            <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-semibold text-xs sm:text-sm hidden md:table-cell">Email</th>
                            <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-semibold text-xs sm:text-sm">Phone</th>
                            <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-semibold text-xs sm:text-sm">Quotation</th>
                            <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-semibold text-xs sm:text-sm">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customersData.map((item, index) => (
                            <tr
                                key={item.id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition"
                            >
                                <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">{index + 1}</td>
                                <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium text-gray-800">
                                    {item.name}
                                </td>
                                <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hidden sm:table-cell">{item.company}</td>
                                <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hidden md:table-cell break-words">{item.email}</td>
                                <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">{item.phone}</td>
                                <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">{item.totalQuotation}</td>
                                <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                                    <span
                                        className={`px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-medium ${
                                            item.status === "Active"
                                                ? "bg-[#ECFDF3] text-[#037847]"
                                                : "bg-[#F2F4F7] text-[#364254]"
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentDetails;
