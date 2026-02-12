import { useState } from "react";
import CommonTable from "../../common/table";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomerQuotation = () => {
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const customers = useState([
        {
            id: 1,
            qtnno: "QTN-001",
            name: "Mani",
            amount: "65,000",

        },
    ]);

    /* ---------------- OPEN ADD FORM ---------------- */
    const handleAdd = () => {
        setMode("add");
        setEditData(null);
        setOpenForm(true);
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
            name: "Action",
            cell: (row) => (
                <div className="flex justify-center">
                    <button
                        onClick={() => navigate(`/users/view/${row.id}`)}
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
                <div className="flex items-center p-6 justify-between">
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
                            onClick={handleAdd}
                            className="bg-primary text-white px-4 py-2 text-sm">

                            + Create Quotation
                        </button>
                    }
                    noPagination={false}
                />
            </div>
        </>
    );
};

export default CustomerQuotation;
