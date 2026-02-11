import { Images } from "../../common/assets";

const stats = [
    {
        title: "Total Quotations",
        value: "450",
        icon: Images.totalQuote,
        bg: "bg-[#165DFF]",
        iconColor: "text-white",
    },
    {
        title: "Total Customers",
        value: "58",
        icon: Images.totalCust,
        bg: "bg-[#F7BA1E]",
        iconColor: "text-white",
    },
    {
        title: "Total Users",
        value: "+130",
        icon: Images.totalUser,
        bg: "bg-[#14C9C9]",
        iconColor: "text-white",
    },   
];

const CardSection = () => {
    return (
        <div className="flex w-full gap-4">
            {stats.map((item, index) => {
                const Icon = item.icon;
                return (
                    <div
                        key={index}
                        className="flex-1 bg-white rounded-xl border border-lineColor px-6 py-4 shadow-md transition"
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
