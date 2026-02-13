import { useState, useEffect } from "react";
import CommonTable from "../../common/table";
import { PencilLine } from "lucide-react";
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
    const [confirmPopup, setConfirmPopup] = useState({
        open: false,
        id: null,
        status: null,
    });

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
                    username: formData.username || undefined,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    is_active: true,
                });
            } else {
                response = await updateUserApi(formData.id, {
                    name: formData.name,
                    username: formData.username || undefined,
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
            name: "Username",
            selector: (row) => row.username || "-",
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
            name: "Created By",
            cell: (row) => {
                const formatDate = (dateString) => {
                    if (!dateString) return "";
                    try {
                        const date = new Date(dateString);
                        return date.toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        });
                    } catch (error) {
                        return "";
                    }
                };

                const createdBy = row.created_by || "-";
                const createdAt = row.created_at ? formatDate(row.created_at) : "";

                return (
                    <div className="flex flex-col">
                        <span className="text-textPrimary font-medium">{createdBy}</span>
                        {createdAt && (
                            <span className="text-xs text-textSecondary mt-0.5">{createdAt}</span>
                        )}
                    </div>
                );
            },
        },
        {
            name: "Updated By",
            cell: (row) => {
                const formatDate = (dateString) => {
                    if (!dateString) return "";
                    try {
                        const date = new Date(dateString);
                        return date.toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        });
                    } catch (error) {
                        return "";
                    }
                };

                const updatedBy = row.updated_by || "-";
                const updatedAt = row.updated_at ? formatDate(row.updated_at) : "";

                return (
                    <div className="flex flex-col">
                        <span className="text-textPrimary font-medium">{updatedBy}</span>
                        {updatedAt && updatedBy !== "-" && (
                            <span className="text-xs text-textSecondary mt-0.5">{updatedAt}</span>
                        )}
                    </div>
                );
            },
        },
        {
            name: "Status",
            cell: (row) => (
                <span
                    className={`inline-flex items-center gap-2 px-2 py-1 text-xs rounded-full font-medium
            ${row.active ? "bg-[#ECFDF3] text-[#037847]" : "bg-gray-200 text-[#364254]"}
        `}
                >
                    {/* Dot */}
                    <span
                        className={`w-2 h-2 rounded-full
                ${row.active ? "bg-[#037847]" : "bg-[#364254]"}
            `}
                    ></span>

                    {row.active ? "Active" : "Inactive"}
                </span>
            ),
            center: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <div className="flex items-center gap-2">

                    {/* Toggle */}
                    <button
                        onClick={() =>
                            setConfirmPopup({
                                open: true,
                                id: row.id,
                                status: row.active,
                            })
                        }
                        className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors
                ${row.active ? "bg-primary" : "bg-lightGrey"}
            `}
                    >
                        <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform
                    ${row.active ? "translate-x-5" : "translate-x-0"}
                `}
                        />
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

            {/* STATUS CONFIRM POPUP */}
            {confirmPopup.open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
                    <div className="bg-white shadow-lg w-80 p-6">
                        <h3 className="text-lg font-medium mb-4">
                            Confirm Status Change
                        </h3>

                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure want to{" "}
                            <span className="font-semibold">
                                {confirmPopup.status ? "Deactivate" : "Activate"}
                            </span>{" "}
                            this user?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() =>
                                    setConfirmPopup({ open: false, id: null, status: null })
                                }
                                className="px-4 py-2 text-sm bg-gray-200"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    toggleStatus(confirmPopup.id);
                                    setConfirmPopup({ open: false, id: null, status: null });
                                }}
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

export default Users;
