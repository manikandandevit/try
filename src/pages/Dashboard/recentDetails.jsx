const customersData = [
    {
        id: 1,
        name: "Arun Kumar",
        company: "TechNova Pvt Ltd",
        email: "arun@technova.com",
        phone: "9876543210",
        totalQuotation: 12,
        status: "Active",
    },
    {
        id: 2,
        name: "Priya Sharma",
        company: "FinEdge Solutions",
        email: "priya@finedge.com",
        phone: "9123456780",
        totalQuotation: 8,
        status: "Inactive",
    },
    {
        id: 3,
        name: "Rahul Verma",
        company: "BuildCore Infra",
        email: "rahul@buildcore.com",
        phone: "9988776655",
        totalQuotation: 15,
        status: "Active",
    },
    {
        id: 4,
        name: "Sneha Iyer",
        company: "Creative Minds",
        email: "sneha@creativeminds.com",
        phone: "9090909090",
        totalQuotation: 5,
        status: "Inactive",
    },
    {
        id: 5,
        name: "Mohit Jain",
        company: "NextGen IT",
        email: "mohit@nextgenit.com",
        phone: "9812345678",
        totalQuotation: 10,
        status: "Active",
    },
];

const RecentDetails = () => {
    return (
        <div className="w-full bg-white border border-lineColor overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">

                {/* TABLE HEADER */}
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

                {/* TABLE BODY */}
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

                            {/* STATUS BADGE */}
                            <td className="px-6 py-4">
                                <span
                                    className={`px-3 py-1 rounded-md text-xs font-medium
                ${item.status === "Active"
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
