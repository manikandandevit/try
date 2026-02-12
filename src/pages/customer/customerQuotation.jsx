import { useState } from "react";
import CommonTable from "../../common/table";
import { ArrowLeft, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomerQuotation = () => {
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const [confirmPopup, setConfirmPopup] = useState({
        open: false,
        id: null,
        oldStatus: "",
        newStatus: "",
    });

    const [customers, setCustomers] = useState([
        {
            id: 1,
            qtnno: "QTN-001",
            name: "Mani",
            amount: "65,000",
            status: "Draft", // Draft | Submitted | Awarded
        },
        {
            id: 2,
            qtnno: "QTN-002",
            name: "Mani",
            amount: "65,000",
            status: "submitted", // Draft | Submitted | Awarded
        },

    ]);

    const handleStatusChange = (id, newStatus) => {
        const currentItem = customers.find((item) => item.id === id);
        if (!currentItem) return;

        if (currentItem.status === newStatus) return;

        setConfirmPopup({
            open: true,
            id,
            oldStatus: currentItem.status,
            newStatus,
        });
    };

    const confirmStatusChange = () => {
        setCustomers((prev) =>
            prev.map((item) =>
                item.id === confirmPopup.id
                    ? { ...item, status: confirmPopup.newStatus }
                    : item
            )
        );

        setConfirmPopup({
            open: false,
            id: null,
            oldStatus: "",
            newStatus: "",
        });
    };



    /* ---------------- TABLE COLUMNS ---------------- */
    const columns = [
        {
            name: "S.No",
            selector: (_, index) => index + 1,
            width: "80px",
        },
        {
            name: "Qtn Number",
            selector: (row) => row.qtnno,
        },
        {
            name: "User Name",
            selector: (row) => row.name,
        },
        {
            name: "Quote Amount",
            selector: (row) => row.amount,
        },
        {
            name: "Status",
            cell: (row) => {
                if (row.status === "Draft") {
                    return (
                        <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                            Draft
                        </span>
                    );
                }

                return (
                    <select
                        value={row.status}
                        onChange={(e) =>
                            handleStatusChange(row.id, e.target.value)
                        }
                        className={`px-3 py-1 text-xs rounded-full font-medium border-none focus:outline-none cursor-pointer
                    ${row.status === "submitted"
                                ? "bg-[#BADDFF] text-[#2F80ED]"
                                : "bg-[#B0DAB2] text-[#068F0B]"
                            }
                `}
                    >
                        <option value="submitted">Submitted</option>
                        <option value="awarded">Awarded</option>
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
                        onClick={() => navigate(`/quotation/${row.id}`)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-lightGrey hover:bg-primary/10 transition"
                    >
                        <Eye size={16} className="text-darkGrey" />
                    </button>
                </div>
            ),
            center: true,
        }
    ];

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm">

                {/* HEADER */}
                <div className="flex items-center p-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="mr-3 p-2 rounded-full hover:bg-gray-100 transition"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <h2 className="text-xl font-medium text-textColor">
                        Arun
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
                            onClick={() => navigate("/quotation")}
                            className="bg-primary text-white px-4 py-2 text-sm">

                            + Create Quotation
                        </button>
                    }
                    noPagination={false}
                />
            </div>

            {/* STATUS CONFIRM POPUP */}
            {confirmPopup.open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
                    <div className="bg-white shadow-lg w-96 p-6">
                        <h3 className="text-lg font-medium mb-4">
                            Confirm Status Change
                        </h3>

                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure want to change status from{" "}
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
