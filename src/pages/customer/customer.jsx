import { useState } from "react";
import CommonTable from "../../common/table";
import { PencilLine, Eye } from "lucide-react";
import CustomerForm from "./customerForm";
import { useNavigate } from "react-router-dom";

const Customers = () => {
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([
        {
            id: 1,
            name: "Arun Kumar",
            company: "TechNova Pvt Ltd",
            phone: "9876543210",
            email: "arun@technova.com",
            address: "Chennai, Tamil Nadu",
            gst: "33ABCDE1234F1Z5",
            totalQuote: "25",
            active: true,
        },
    ]);

    /* ---------------- FORM STATE ---------------- */
    const [openForm, setOpenForm] = useState(false);
    const [mode, setMode] = useState("add"); // add | edit
    const [editData, setEditData] = useState(null);

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
    const handleSave = (formData) => {
        if (mode === "add") {
            const newCustomer = {
                ...formData,
                id: customers.length + 1,
                active: true,
            };
            setCustomers((prev) => [...prev, newCustomer]);
        } else {
            setCustomers((prev) =>
                prev.map((item) =>
                    item.id === formData.id ? { ...item, ...formData } : item
                )
            );
        }
    };

    /* ---------------- TOGGLE STATUS ---------------- */
    const toggleStatus = (id) => {
        setCustomers((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, active: !item.active } : item
            )
        );
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
            name: "Action",
            cell: (row) => (
                <div className="flex items-center gap-2">

                    {/* Toggle */}
                    <button
                        onClick={() => toggleStatus(row.id)}
                        className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors
              ${row.active ? "bg-primary" : "bg-red-300"}
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
                    >
                        <Eye size={16} className="text-darkGrey" />
                    </button>

                    {/* Edit */}
                    <button
                        onClick={() => handleEdit(row)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-lightGrey hover:bg-primary/10 transition"
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
