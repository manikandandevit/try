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
            <div className="w-full bg-white border border-lineColor rounded-xl p-8 flex justify-center items-center min-h-[200px]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!customersData.length) {
        return (
            <div className="w-full bg-white border border-lineColor rounded-xl p-8 text-center text-gray-500 text-sm">
                No customers found
            </div>
        );
    }

    return (
        <div className="w-full bg-white border border-lineColor overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="text-gray-600 bg-[#DFEFFF] border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 font-semibold">S. No</th>
                        <th className="px-6 py-4 font-semibold">Customer Name</th>
                        <th className="px-6 py-4 font-semibold">Company Name</th>
                        <th className="px-6 py-4 font-semibold">Email</th>
                        <th className="px-6 py-4 font-semibold">Phone Number</th>
                        <th className="px-6 py-4 font-semibold">Total Quotation</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {customersData.map((item, index) => (
                        <tr
                            key={item.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition"
                        >
                            <td className="px-6 py-4">{index + 1}</td>
                            <td className="px-6 py-4 font-medium text-gray-800">
                                {item.name}
                            </td>
                            <td className="px-6 py-4">{item.company}</td>
                            <td className="px-6 py-4">{item.email}</td>
                            <td className="px-6 py-4">{item.phone}</td>
                            <td className="px-6 py-4">{item.totalQuotation}</td>
                            <td className="px-6 py-4">
                                <span
                                    className={`px-3 py-1 rounded-md text-xs font-medium ${
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
    );
};

export default RecentDetails;
