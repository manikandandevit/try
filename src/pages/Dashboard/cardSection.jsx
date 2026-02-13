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
        },
        {
            title: "Total Customers",
            value: loading ? "..." : stats.totalCustomers.toString(),
            icon: Images.totalCust,
            bg: "bg-[#F7BA1E]",
            iconColor: "text-white",
        },
        {
            title: "Total Users",
            value: loading ? "..." : stats.totalUsers.toString(),
            icon: Images.totalUser,
            bg: "bg-[#14C9C9]",
            iconColor: "text-white",
        },
    ];

    const handleCardClick = (path) => {
        navigate(path);
    };

    return (
        <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-4">
            {cardData.map((item, index) => {
                return (
                    <div
                        key={index}
                        onClick={() => handleCardClick(item.path)}
                        className="flex-1 bg-white rounded-lg sm:rounded-xl border border-lineColor px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-4 shadow-md transition-all cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {/* TOP TITLE */}
                        <p className="text-sm sm:text-base md:text-lg font-semibold text-textPrimary mb-2 sm:mb-3">{item.title}</p>

                        {/* SECOND ROW */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#172B4D]">
                                {item.value}
                            </h2>

                            <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center ${item.bg} shrink-0`}
                            >
                                <img
                                    src={item.icon}
                                    alt={item.title}
                                    className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 object-contain"
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
