import { useState, useEffect, useCallback } from "react";
import CommonTable from "../../common/table";
import { ArrowLeft, Eye } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getCustomerQuotationsApi, createCustomerQuotationApi } from "../../API/customerApi";
import { updateQuotationStatus } from "../../API/quotationApi";
import { getCurrentUserApi } from "../../API/authApi";
import toast from "../../common/toast";

const CustomerQuotation = () => {
    const { id: customerId } = useParams();
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [customerName, setCustomerName] = useState("");
    const [client, setClient] = useState(null); // Full client for passing to Quotation view
    const [quotations, setQuotations] = useState([]);
    const [confirmPopup, setConfirmPopup] = useState({
        open: false,
        id: null,
        oldStatus: "",
        newStatus: "",
    });
    const [creating, setCreating] = useState(false);

    const fetchQuotations = useCallback(async () => {
        if (!customerId) return;
        setLoading(true);
        try {
            const response = await getCustomerQuotationsApi(customerId);
            if (response.success && response.data) {
                const data = response.data;
                const clientData = data.client;
                setCustomerName(clientData?.customer_name || "Customer");
                setClient(clientData || null);
                setQuotations(data.quotations || []);
            } else {
                toast.error(response.message || "Failed to load quotations");
                setQuotations([]);
            }
        } catch (error) {
            toast.error("Error loading quotations");
            setQuotations([]);
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchQuotations();
    }, [fetchQuotations]);

    const handleCreateQuotation = async () => {
        if (!customerId) return;
        setCreating(true);
        try {
            const response = await createCustomerQuotationApi(customerId);
            let newQuotation = response.data?.quotation || response.quotation;
            if (response.success && newQuotation) {
                // Ensure list shows same username as navbar (current logged-in user)
                const currentUser = await getCurrentUserApi();
                if (currentUser.success && currentUser.displayName) {
                    newQuotation = { ...newQuotation, user_name: currentUser.displayName };
                }
                setQuotations((prev) => [newQuotation, ...prev]);
                toast.success("Quotation created");
                // Stay on same page (customer quotation list)
            } else {
                toast.error(response.message || "Failed to create quotation");
            }
        } catch (error) {
            toast.error("Error creating quotation");
        } finally {
            setCreating(false);
        }
    };

    const handleStatusChange = (id, newStatus) => {
        const currentItem = quotations.find((item) => item.id === id);
        if (!currentItem) return;
        if (currentItem.status === newStatus) return;
        setConfirmPopup({
            open: true,
            id,
            oldStatus: currentItem.status,
            newStatus,
        });
    };

    const confirmStatusChange = async () => {
        try {
            const res = await updateQuotationStatus(confirmPopup.id, confirmPopup.newStatus);
            if (res.success) {
                setQuotations((prev) =>
                    prev.map((item) =>
                        item.id === confirmPopup.id
                            ? { ...item, status: confirmPopup.newStatus }
                            : item
                    )
                );
                toast.success("Status updated");
            } else {
                toast.error(res.message || "Failed to update status");
            }
        } catch (e) {
            toast.error("Failed to update status");
        }
        setConfirmPopup({ open: false, id: null, oldStatus: "", newStatus: "" });
    };

    const formatAmount = (amount) => {
        if (amount == null || amount === "") return "—";
        const num = Number(amount);
        if (isNaN(num)) return String(amount);
        return new Intl.NumberFormat("en-IN", {
            style: "decimal",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(num);
    };

    const formatDate = (sentAt) => {
        if (!sentAt) return "—";
        try {
            const d = new Date(sentAt);
            return isNaN(d.getTime()) ? sentAt : d.toLocaleDateString("en-IN", { dateStyle: "short" });
        } catch {
            return sentAt;
        }
    };

    const columns = [
        {
            name: "S.No",
            selector: (_, index) => index + 1,
            width: "80px",
        },
        {
            name: "QUOT_NO",
            selector: (row) => row.quotation_number || "—",
        },
        {
            name: "USER_NAME",
            selector: (row) => row.user_name || "—",
        },
        {
            name: "Total_Amount",
            selector: (row) => formatAmount(row.amount),
        },
        {
            name: "Status",
            cell: (row) => {
                const status = (row.status || "draft").toLowerCase();
                const options =
                    status === "draft"
                        ? [{ value: "draft", label: "Draft" }]
                        : status === "submitted"
                        ? [
                              { value: "submitted", label: "Submitted" },
                              { value: "awarded", label: "Awarded" },
                          ]
                        : [{ value: "awarded", label: "Awarded" }];
                return (
                    <select
                        value={status}
                        onChange={(e) => {
                            const newStatus = e.target.value;
                            if (newStatus !== status) handleStatusChange(row.id, newStatus);
                        }}
                        className={`w-full max-w-[120px] px-2 py-1 text-xs rounded-full border-0 font-medium focus:ring-2 focus:ring-primary/30 outline-none cursor-pointer
                            ${status === "draft" ? "bg-gray-100 text-gray-600" : ""}
                            ${status === "submitted" ? "bg-[#BADDFF] text-[#2F80ED]" : ""}
                            ${status === "awarded" ? "bg-[#B0DAB2] text-[#068F0B]" : ""}`}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );
            },
            center: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <div className="flex justify-center">
                    <button
                        onClick={() =>
                            navigate(`/quotation/${row.id}`, {
                                state: {
                                    fromCustomerView: true,
                                    customer: client ? {
                                        id: client.id,
                                        customer_name: client.customer_name || customerName,
                                        email: client.email || "",
                                        address: client.address || "",
                                        phone_number: client.phone_number || "",
                                    } : null,
                                    quotNo: row.quotation_number,
                                },
                            })
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-lightGrey hover:bg-primary/10 transition"
                        title="View Quotation"
                    >
                        <Eye size={16} className="text-darkGrey" />
                    </button>
                </div>
            ),
            center: true,
        },
    ];

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm">
                <div className="flex items-center p-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="mr-3 p-2 rounded-full hover:bg-gray-100 transition"
                        title="Back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-medium text-textColor">
                        {customerName}
                    </h2>
                </div>

                <CommonTable
                    columns={columns}
                    data={quotations}
                    searchValue={search}
                    onSearch={setSearch}
                    searchPlaceholder="Search by quotation number"
                    rightActions={
                        <button
                            onClick={handleCreateQuotation}
                            disabled={creating}
                            className="bg-primary text-white px-4 py-2 text-sm disabled:opacity-60"
                        >
                            + Create Quotation
                        </button>
                    }
                    noPagination={false}
                    loading={loading}
                />
            </div>

            {confirmPopup.open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
                    <div className="bg-white shadow-lg w-96 p-6">
                        <h3 className="text-lg font-medium mb-4">
                            Confirm Status Change
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to change status from{" "}
                            <span className="font-semibold capitalize">
                                {confirmPopup.oldStatus}
                            </span>{" "}
                            to{" "}
                            <span className="font-semibold capitalize">
                                {confirmPopup.newStatus}
                            </span>
                            ?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() =>
                                    setConfirmPopup({
                                        open: false,
                                        id: null,
                                        oldStatus: "",
                                        newStatus: "",
                                    })
                                }
                                className="px-4 py-2 text-sm bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStatusChange}
                                className="px-4 py-2 text-sm bg-primary text-white"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CustomerQuotation;
