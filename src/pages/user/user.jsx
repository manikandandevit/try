import { useState, useEffect } from "react";
import CommonTable from "../../common/table";
import { PencilLine, Eye } from "lucide-react";
import UserForm from "./userForm";
import { getAllUsersApi, addUserApi, updateUserApi, updateUserStatusApi } from "../../API/userApi";
import toast from "../../common/toast";

const Users = () => {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    /* ---------------- FORM STATE ---------------- */
    const [openForm, setOpenForm] = useState(false);
    const [mode, setMode] = useState("add");
    const [editData, setEditData] = useState(null);

    /* ---------------- FETCH USERS ---------------- */
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getAllUsersApi({
                page: page,
                limit: 10,
                search: search,
                isActive: "",
            });
            if (response.success) {
                setUsers(response.data || []);
                if (response.pagination) {
                    setTotalPages(response.pagination.pages || 1);
                }
            } else {
                toast.error(response.message || "Failed to fetch users");
            }
        } catch (error) {
            toast.error("Error fetching users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

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
    const handleSave = async (formData) => {
        try {
            let response;
            if (mode === "add") {
                response = await addUserApi({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    is_active: true,
                });
            } else {
                response = await updateUserApi(formData.id, {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password || undefined,
                    is_active: editData?.active ?? true,
                });
            }

            if (response.success) {
                toast.success(mode === "add" ? "User added successfully" : "User updated successfully");
                setOpenForm(false);
                fetchUsers();
            } else {
                toast.error(response.message || "Failed to save user");
            }
        } catch (error) {
            toast.error("Error saving user");
        }
    };

    /* ---------------- TOGGLE STATUS ---------------- */
    const toggleStatus = async (id) => {
        try {
            const response = await updateUserStatusApi(id);
            if (response.success) {
                toast.success(response.message || "User status updated successfully");
                fetchUsers();
            } else {
                toast.error(response.message || "Failed to update user status");
            }
        } catch (error) {
            toast.error("Error updating user status");
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
                    loading={loading}
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
