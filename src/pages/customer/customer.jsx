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

    /* ---------------- FETCH CUSTOMERS ---------------- */
    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllCustomersApi(search);
            if (response.success) {
                // Map backend data to frontend format
                const clients = response.data?.clients || response.data || [];
                const mappedCustomers = clients.map((client) => ({
                    id: client.id,
                    name: client.customer_name || "",
                    company: client.company_name || "",
                    phone: client.phone_number || "",
                    email: client.email || "",
                    address: client.address || "",
                    gst: client.gst || "", // Backend doesn't have GST, but keeping for compatibility
                    totalQuote: "0", // This would need a separate API call to get quote count
                    active: client.is_active ?? true,
                }));
                setCustomers(mappedCustomers);
            } else {
                toast.error(response.message || "Failed to fetch customers");
            }
        } catch (error) {
            toast.error("Error fetching customers");
            console.error("Error fetching customers:", error);
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
                    response.message || 
                    `Customer ${newStatus ? "Activated" : "Inactivated"} successfully`
                );
                fetchCustomers(); // Refresh the list
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
            name: "Status",
            cell: (row) => (
                <button
                    onClick={() => toggleStatus(row.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                        ${row.active 
                            ? "bg-green-100 text-green-700 hover:bg-green-200" 
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }
                    `}
                    title={row.active ? "Click to deactivate" : "Click to activate"}
                >
                    <div
                        className={`w-2 h-2 rounded-full transition-colors
                            ${row.active ? "bg-green-500" : "bg-red-500"}
                        `}
                    />
                    <span>{row.active ? "Active" : "Inactive"}</span>
                </button>
            ),
            center: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <div className="flex items-center gap-2">
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
                <div className="flex items-center p-6 justify-between">
                    <h2 className="text-xl font-medium text-textColor">
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
        </>
    );
};

export default Customers;
