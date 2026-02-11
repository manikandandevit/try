import { useState } from "react";
import CommonTable from "../../common/table";
import { PencilLine, Eye } from "lucide-react";
import UserForm from "./userForm";

const Users = () => {
    const [search, setSearch] = useState("");

    const [users, setUsers] = useState([
        {
            id: 1,
            name: "Mohammed Azarudeen",
            email: "azar@gmail.com",
            phone: "9876543210",
            active: true,
        },
    ]);

    /* ---------------- FORM STATE ---------------- */
    const [openForm, setOpenForm] = useState(false);
    const [mode, setMode] = useState("add");
    const [editData, setEditData] = useState(null);

    /* ---------------- OPEN ADD ---------------- */
    const handleAdd = () => {
        setMode("add");
        setEditData(null);
        setOpenForm(true);
    };

    /* ---------------- OPEN EDIT ---------------- */
    const handleEdit = (row) => {
        setMode("edit");
        setEditData(row);
        setOpenForm(true);
    };

    /* ---------------- SAVE ---------------- */
    const handleSave = (formData) => {
        if (mode === "add") {
            const newUser = {
                ...formData,
                id: users.length + 1,
                active: true,
            };
            setUsers((prev) => [...prev, newUser]);
        } else {
            setUsers((prev) =>
                prev.map((item) =>
                    item.id === formData.id ? { ...item, ...formData } : item
                )
            );
        }
    };

    /* ---------------- TOGGLE STATUS ---------------- */
    const toggleStatus = (id) => {
        setUsers((prev) =>
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
            name: "Name",
            selector: (row) => row.name,
        },
        {
            name: "Email",
            selector: (row) => row.email,
        },
        {
            name: "Phone",
            selector: (row) => row.phone,
        },
        {
            name: "Status",
            cell: (row) => (
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
            ),
            center: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    {/* View */}
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lightGrey hover:bg-primary/10 transition">
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
                    <h2 className="text-xl font-medium text-textPrimary">
                        User List
                    </h2>
                   
                </div>

                {/* TABLE */}
                <CommonTable
                    columns={columns}
                    data={users}
                    searchValue={search}
                    onSearch={setSearch}
                    searchPlaceholder="Search User"
                    rightActions={
                        <button
                            onClick={handleAdd}
                            className="bg-primary text-white px-4 py-2 text-sm">

                            + Add User
                        </button>
                    }
                    noPagination={false}
                />
            </div>

            {/* FORM */}
            <UserForm
                open={openForm}
                mode={mode}
                editData={editData}
                onClose={() => setOpenForm(false)}
                onSubmit={handleSave}
            />
        </>
    );
};

export default Users;
