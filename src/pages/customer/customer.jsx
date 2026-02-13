import { useState, useEffect, useCallback } from "react";
import CommonTable from "../../common/table";
import { PencilLine, Eye } from "lucide-react";
import CustomerForm from "./customerForm";
import { useNavigate } from "react-router-dom";
import {
    getAllCustomersApi,
    addCustomerApi,
    updateCustomerApi,
    updateCustomerStatusApi
} from "../../API/customerApi";
import toast from "../../common/toast";

const Customers = () => {
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

    /* ---------------- FORM STATE ---------------- */
    const [openForm, setOpenForm] = useState(false);
    const [mode, setMode] = useState("add"); // add | edit
    const [editData, setEditData] = useState(null);
    const [confirmPopup, setConfirmPopup] = useState({
        open: false,
        id: null,
        status: null,
    });

    /* ---------------- FETCH CUSTOMERS ---------------- */
    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllCustomersApi(search);
            if (response.success) {
                // Support both shapes: { clients: [] } or direct array
                const raw = response.data;
                const clients = Array.isArray(raw)
                    ? raw
                    : (raw?.clients ?? []);
                const mappedCustomers = clients.map((client) => ({
                    id: client.id,
                    name: client.customer_name ?? client.name ?? "",
                    company: client.company_name ?? client.company ?? "",
                    phone: client.phone_number ?? client.phone ?? "",
                    email: client.email ?? "",
                    address: client.address ?? "",
                    gst: client.gst ?? "",
                    totalQuote: String(
                        client.quotation_sent_count ?? client.totalQuotation ?? 0
                    ),
                    active: client.is_active ?? client.active ?? true,
                    created_by: client.created_by ?? "-",
                }));
                setCustomers(mappedCustomers);
            } else {
                toast.error(response.message || "Failed to fetch customers");
                setCustomers([]);
            }
        } catch (error) {
            toast.error("Error fetching customers");
            console.error("Error fetching customers:", error);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    /* ---------------- OPEN ADD FORM ---------------- */
    const handleAdd = () => {
        setMode("add");
        setEditData(null);
        setOpenForm(true);
    };

    /* ---------------- OPEN EDIT FORM ---------------- */
    const handleEdit = (row) => {
        setMode("edit");
        setEditData(row);
        setOpenForm(true);
    };

    /* ---------------- SAVE DATA ---------------- */
    const handleSave = async (formData) => {
        try {
            let response;
            if (mode === "add") {
                response = await addCustomerApi({
                    customerName: formData.customerName || formData.name,
                    companyName: formData.companyName || formData.company,
                    phone: formData.phone,
                    email: formData.email,
                    address: formData.address,
                });
            } else {
                response = await updateCustomerApi(formData.id, {
                    customerName: formData.customerName || formData.name,
                    companyName: formData.companyName || formData.company,
                    phone: formData.phone,
                    email: formData.email,
                    address: formData.address,
                });
            }

            if (response.success) {
                toast.success(
                    mode === "add"
                        ? "Customer added successfully"
                        : "Customer updated successfully"
                );
                setOpenForm(false);
                fetchCustomers(); // Refresh the list
            } else {
                toast.error(response.message || "Failed to save customer");
            }
        } catch (error) {
            toast.error("Error saving customer");
            console.error("Error saving customer:", error);
        }
    };

    /* ---------------- TOGGLE STATUS ---------------- */
    const toggleStatus = async (id) => {
        try {
            const customer = customers.find((c) => c.id === id);
            if (!customer) return;

            const newStatus = !customer.active;
            // Map frontend customer data to backend format
            const backendCustomerData = {
                customer_name: customer.name,
                company_name: customer.company,
                phone_number: customer.phone,
                email: customer.email,
                address: customer.address,
            };

            const response = await updateCustomerStatusApi(id, newStatus, backendCustomerData);

            if (response.success) {
                toast.success(
                    `Customer ${newStatus ? "Activated" : "Deactivated"} successfully`
                );
                fetchCustomers();
            } else {
                toast.error(response.message || "Failed to update customer status");
            }
        } catch (error) {
            toast.error("Error updating customer status");
            console.error("Error updating customer status:", error);
        }
    };

    /* ---------------- TABLE COLUMNS ---------------- */
    const columns = [
        {
            name: "S.No",
            selector: (_, index) => index + 1,
            width: "80px",
        },
        {
            name: "Customer Name",
            selector: (row) => row.name,
        },
        {
            name: "Company Name",
            selector: (row) => row.company,
        },
        {
            name: "Phone No",
            selector: (row) => row.phone,
        },
        {
            name: "Email",
            selector: (row) => row.email,
        },
        {
            name: "Address",
            selector: (row) => row.address,
        },
        {
            name: "Total Quotation",
            selector: (row) => row.totalQuote,
        },
        {
            name: "Created By",
            selector: (row) => row.created_by || "-",
        },
        {
            name: "Status",
            selector: (row) => (row.active ? "Active" : "Inactive"),
            cell: (row) => (
                <span
                    className={`px-3 py-1 rounded-md text-xs font-medium ${
                        row.active
                            ? "bg-[#ECFDF3] text-[#037847]"
                            : "bg-[#F2F4F7] text-[#364254]"
                    }`}
                >
                    {row.active ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            name: "Action",
            cell: (row) => (
                <div className="flex items-center gap-2">

                    {/* Status Toggle */}
                    {/* Toggle Only */}
                    <button
                        onClick={() =>
                            setConfirmPopup({
                                open: true,
                                id: row.id,
                                status: row.active,
                            })
                        }
                        className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors
        ${row.active ? "bg-primary" : "bg-gray-300"}
    `}
                    >
                        <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform
            ${row.active ? "translate-x-5" : "translate-x-0"}
        `}
                        />
                    </button>

                    {/* View */}
                    <button
                        onClick={() => navigate(`/customer/quote/${row.id}`)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-lightGrey hover:bg-primary/10 transition"
                        title="View Quotations"
                    >
                        <Eye size={16} className="text-darkGrey" />
                    </button>

                    {/* Edit */}
                    <button
                        onClick={() => handleEdit(row)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-lightGrey hover:bg-primary/10 transition"
                        title="Edit Customer"
                    >
                        <PencilLine size={16} className="text-darkGrey" />
                    </button>

                </div>
            ),
            center: true,
        },
    ];

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm">

                {/* HEADER */}
                <div className="flex items-center p-3 sm:p-4 md:p-6 justify-between">
                    <h2 className="text-base sm:text-lg md:text-xl font-medium text-textColor">
                        Customer List
                    </h2>
                </div>

                {/* TABLE */}
                <CommonTable
                    columns={columns}
                    data={customers}
                    searchValue={search}
                    onSearch={setSearch}
                    searchPlaceholder="Search Customer"
                    rightActions={
                        <button
                            onClick={handleAdd}
                            className="bg-primary text-white px-4 py-2 text-sm">
                            + Add Customer
                        </button>
                    }
                    noPagination={false}
                    loading={loading}
                />
            </div>

            {/* FORM */}
            <CustomerForm
                open={openForm}
                mode={mode}
                editData={editData}
                onClose={() => setOpenForm(false)}
                onSubmit={handleSave}
            // onSuccess={handleSave}
            />

            {/* STATUS CONFIRM POPUP */}
            {confirmPopup.open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4">
                    <div className="bg-white shadow-lg w-full max-w-sm sm:w-80 p-4 sm:p-6 rounded-lg">
                        <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
                            Confirm Status Change
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                            Are you sure want to{" "}
                            <span className="font-semibold">
                                {confirmPopup.status ? "Deactivate" : "Activate"}
                            </span>{" "}
                            this customer?
                        </p>

                        <div className="flex justify-end gap-2 sm:gap-3">
                            <button
                                onClick={() =>
                                    setConfirmPopup({ open: false, id: null, status: null })
                                }
                                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-200 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    toggleStatus(confirmPopup.id);
                                    setConfirmPopup({ open: false, id: null, status: null });
                                }}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-primary text-white rounded"
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

export default Customers;
