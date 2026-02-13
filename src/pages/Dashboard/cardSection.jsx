import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Images } from "../../common/assets";
import { getDashboardStatsApi } from "../../API/customerApi";

const CardSection = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalQuotations: 0,
        totalCustomers: 0,
        totalUsers: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await getDashboardStatsApi();
                if (response.success && response.data?.kpis) {
                    setStats({
                        totalQuotations: response.data.kpis.total_quotations || 0,
                        totalCustomers: response.data.kpis.total_customers || 0,
                        totalUsers: response.data.kpis.total_users || 0,
                    });
                }
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cardData = [
        {
            title: "Total Quotations",
            value: loading ? "..." : stats.totalQuotations.toString(),
            icon: Images.totalQuote,
            bg: "bg-[#165DFF]",
            iconColor: "text-white",
            path: "/quotation",
        },
        {
            title: "Total Customers",
            value: loading ? "..." : stats.totalCustomers.toString(),
            icon: Images.totalCust,
            bg: "bg-[#F7BA1E]",
            iconColor: "text-white",
            path: "/customer",
        },
        {
            title: "Total Users",
            value: loading ? "..." : stats.totalUsers.toString(),
            icon: Images.totalUser,
            bg: "bg-[#14C9C9]",
            iconColor: "text-white",
            path: "/users",
        },
    ];

    const handleCardClick = (path) => {
        navigate(path);
    };

    return (
        <div className="flex w-full gap-4">
            {cardData.map((item, index) => {
                return (
                    <div
                        key={index}
                        onClick={() => handleCardClick(item.path)}
                        className="flex-1 bg-white rounded-xl border border-lineColor px-6 py-4 shadow-md transition-all cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {/* TOP TITLE */}
                        <p className="text-lg font-semibold text-textPrimary mb-3">{item.title}</p>

                        {/* SECOND ROW */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-medium text-[#172B4D]">
                                {item.value}
                            </h2>

                            <div
                                className={`w-14 h-14 rounded-full flex items-center justify-center ${item.bg}`}
                            >
                                <img
                                    src={item.icon}
                                    alt={item.title}
                                    className="w-7 h-7 object-contain"
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CardSection;
