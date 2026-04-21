import React, { useEffect, useMemo, useState } from "react";
import LayoutAdmin from "./LayoutAdmin";
import HeaderAdmin from "@/components/admin/HeaderAdmin";
import adminUserApi from "@/utils/api/adminUserApi";

const STATUS_OPTIONS = [
  { label: "Tất cả", value: "" },
  { label: "Hoạt động", value: "ACTIVE" },
  { label: "Đã khóa", value: "LOCKED" },
];

const formatUserStatus = (status) => {
  switch (status) {
    case "ACTIVE":
      return "Hoạt động";
    case "LOCKED":
      return "Đã khóa";
    default:
      return String(status || "-");
  }
};

const UserAdminPage = () => {
  const [users, setUsers] = useState([]);
  const [pageMeta, setPageMeta] = useState({
    page: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10,
  });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetPassword, setResetPassword] = useState("");
  const [createForm, setCreateForm] = useState({
    email: "",
    fullName: "",
    password: "",
  });

  const fetchUsers = async (nextPage = pageMeta.page) => {
    try {
      setLoading(true);
      setError("");
      const res = await adminUserApi.list({
        page: nextPage,
        size: pageMeta.size,
        query: query || undefined,
        status: statusFilter || undefined,
      });
      const data = res?.data?.data;
      setUsers(data?.content || []);
      setPageMeta((prev) => ({
        ...prev,
        page: data?.page ?? nextPage,
        totalPages: data?.totalPages ?? 0,
        totalElements: data?.totalElements ?? 0,
        size: data?.size ?? prev.size,
      }));
    } catch (err) {
      const message =
        err?.response?.data?.data?.message ||
        err?.response?.data?.message ||
        "Không thể tải danh sách người dùng.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(0);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(0);
  };

  const handleStatusToggle = async (user) => {
    const nextStatus = user.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    try {
      await adminUserApi.updateStatus(user.id, { status: nextStatus });
      fetchUsers();
    } catch (err) {
      const message =
        err?.response?.data?.data?.message ||
        err?.response?.data?.message ||
        "Không thể cập nhật trạng thái.";
      alert(message);
    }
  };

  const handleOpenReset = (user) => {
    setSelectedUser(user);
    setResetPassword("");
    setShowReset(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPassword.trim()) {
      alert("Nhập mật khẩu mới.");
      return;
    }
    try {
      await adminUserApi.resetPassword(selectedUser.id, {
        newPassword: resetPassword.trim(),
      });
      setShowReset(false);
      setSelectedUser(null);
      setResetPassword("");
      fetchUsers();
    } catch (err) {
      const message =
        err?.response?.data?.data?.message ||
        err?.response?.data?.message ||
        "Không thể reset mật khẩu.";
      alert(message);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!createForm.email || !createForm.fullName || !createForm.password) {
      alert("Nhập đầy đủ thông tin admin.");
      return;
    }
    try {
      await adminUserApi.createAdmin({
        email: createForm.email.trim(),
        fullName: createForm.fullName.trim(),
        password: createForm.password,
      });
      setShowCreate(false);
      setCreateForm({ email: "", fullName: "", password: "" });
      fetchUsers();
    } catch (err) {
      const message =
        err?.response?.data?.data?.message ||
        err?.response?.data?.message ||
        "Không thể tạo admin.";
      alert(message);
    }
  };

  const formattedTotal = useMemo(() => {
    return Number(pageMeta.totalElements || 0).toLocaleString("de-DE");
  }, [pageMeta.totalElements]);

  return (
    <LayoutAdmin>
      <div className="space-y-6">
        <HeaderAdmin title={"Người dùng"} />

        <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center"
            >
              <input
                className="w-full rounded-md border border-gray-200 px-3 py-2 sm:w-72 lg:w-80"
                placeholder="Tìm theo email, tên..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                className="w-full rounded-md border border-gray-200 px-3 py-2 sm:w-48"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-white"
              >
                Tìm kiếm
              </button>
            </form>

            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="rounded-md bg-emerald-600 px-4 py-2 text-white"
            >
              Tạo tài khoản admin
            </button>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Tổng: {formattedTotal}</span>
            {loading && <span>Đang tải...</span>}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3">SĐT</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3">{user.id}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.fullName || "-"}</td>
                    <td className="px-4 py-3">{user.phoneNumber || "-"}</td>
                    <td className="px-4 py-3">
                      {(user.roles || []).join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {formatUserStatus(user.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(user)}
                          className="rounded-md border border-gray-200 px-3 py-1 text-xs"
                        >
                          {user.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenReset(user)}
                          className="rounded-md border border-gray-200 px-3 py-1 text-xs"
                        >
                          Đặt lại mật khẩu
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-6 text-center text-sm">
                      Không có người dùng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Page {pageMeta.page + 1} / {pageMeta.totalPages || 1}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md border border-gray-200 px-3 py-1 text-sm"
                disabled={pageMeta.page <= 0}
                onClick={() => fetchUsers(pageMeta.page - 1)}
              >
                Prev
              </button>
              <button
                type="button"
                className="rounded-md border border-gray-200 px-3 py-1 text-sm"
                disabled={pageMeta.page + 1 >= pageMeta.totalPages}
                onClick={() => fetchUsers(pageMeta.page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold">Tao admin</h3>
            <form onSubmit={handleCreateAdmin} className="mt-4 space-y-3">
              <input
                className="w-full rounded-md border border-gray-200 px-3 py-2"
                placeholder="Email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
              <input
                className="w-full rounded-md border border-gray-200 px-3 py-2"
                placeholder="Ho ten"
                value={createForm.fullName}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
              />
              <input
                type="password"
                className="w-full rounded-md border border-gray-200 px-3 py-2"
                placeholder="Mat khau"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-md border border-gray-200 px-4 py-2"
                >
                  Huy
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-emerald-600 px-4 py-2 text-white"
                >
                  Tao
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReset && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold">
              Reset mat khau: {selectedUser.email}
            </h3>
            <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
              <input
                type="password"
                className="w-full rounded-md border border-gray-200 px-3 py-2"
                placeholder="Mat khau moi"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReset(false)}
                  className="rounded-md border border-gray-200 px-4 py-2"
                >
                  Huy
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LayoutAdmin>
  );
};

export default UserAdminPage;
