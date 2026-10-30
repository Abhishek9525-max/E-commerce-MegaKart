import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addUser, deleteUser, fetchUsers, updateUser } from "../../redux/slices/adminSlice";

const UserManagement = () => {
  const dispatch= useDispatch();
  const navigate = useNavigate();

  const {user}= useSelector((state)=> state.auth)
  const {users, loading, error}=useSelector((state)=> state.admin)

  useEffect(()=>{
    if(user && user.role !== "admin"){
      navigate("/")
    }
  },[user,navigate])

useEffect(()=>{
  if(user && user.role === "admin"){
    dispatch(fetchUsers())
  }
},[dispatch,user])



  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addUser(formData))
    // console.log(formData);
    //Reset the form after Submisiion
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "customer",
    });
  };

  const handleRoleChange = (userId, newRole) => {
    dispatch(updateUser({id: userId, role: newRole}))
    // console.log({ id: userId, role: newRole });
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || isDeleting) return;

    setIsDeleting(true);
    setDeleteError("");
    try {
      await dispatch(deleteUser(userToDelete._id)).unwrap();
      setUserToDelete(null);
    } catch (requestError) {
      setDeleteError(
        requestError?.message || "Unable to delete user. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <header className="flex flex-col justify-between gap-4 border-b border-[#e7e4dc] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#85847c]">Community</p>
          <h1 className="text-3xl font-medium text-[#292b25] sm:text-4xl">Customer Directory</h1>
          <p className="mt-2 text-sm text-[#77766e]">Manage customer accounts and access roles.</p>
        </div>
        <span className="self-start border border-[#e7e4dc] bg-white px-4 py-2.5 text-xs font-medium text-[#686961] sm:self-auto">
          {users.length} {users.length === 1 ? "account" : "accounts"}
        </span>
      </header>
      {loading && <p className="text-sm text-[#77766e]">Loading customers…</p>}
      {error && <p role="alert" className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Unable to load customers: {error}</p>}

      <section className="border border-[#e7e4dc] bg-white p-5 shadow-[0_8px_24px_rgba(39,46,32,0.035)] sm:p-6">
        <div className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#85847c]">New account</p>
          <h2 className="mt-1 text-xl font-medium text-[#292b25]">Add a user</h2>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <label htmlFor="new-user-name" className="mb-1.5 block text-xs font-medium text-[#55564f]">Name</label>
            <input
              id="new-user-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-[#dedbd3] bg-[#fcfbf9] px-3 py-2.5 text-sm text-[#292b25] outline-none transition focus:border-[#68725b] focus:ring-2 focus:ring-[#414b36]/10"
              required
            />
          </div>
          <div>
            <label htmlFor="new-user-email" className="mb-1.5 block text-xs font-medium text-[#55564f]">Email</label>
            <input
              id="new-user-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-[#dedbd3] bg-[#fcfbf9] px-3 py-2.5 text-sm text-[#292b25] outline-none transition focus:border-[#68725b] focus:ring-2 focus:ring-[#414b36]/10"
              required
            />
          </div>
          <div>
            <label htmlFor="new-user-password" className="mb-1.5 block text-xs font-medium text-[#55564f]">Password</label>
            <input
              id="new-user-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-[#dedbd3] bg-[#fcfbf9] px-3 py-2.5 text-sm text-[#292b25] outline-none transition focus:border-[#68725b] focus:ring-2 focus:ring-[#414b36]/10"
              required
            />
          </div>
          <div>
            <label htmlFor="new-user-role" className="mb-1.5 block text-xs font-medium text-[#55564f]">Role</label>
            <select
              id="new-user-role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-[#dedbd3] bg-[#fcfbf9] px-3 py-2.5 text-sm text-[#292b25] outline-none transition focus:border-[#68725b] focus:ring-2 focus:ring-[#414b36]/10"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center bg-[#414b36] px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#30392a] sm:col-span-2 xl:col-span-4 xl:justify-self-start"
          >
            Add User
          </button>
        </form>
      </section>

      <section className="overflow-hidden border border-[#e7e4dc] bg-white shadow-[0_8px_24px_rgba(39,46,32,0.035)]">
        <div className="border-b border-[#eeece6] px-5 py-5 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#85847c]">Account access</p>
          <h2 className="mt-1 text-xl font-medium text-[#292b25]">All users</h2>
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-[#faf9f6] text-[10px] uppercase tracking-[0.12em] text-[#85847c]">
            <tr>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Name</th>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Email</th>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Role</th>
              <th className="px-5 py-3.5 font-semibold sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eeece6] text-sm">
            {users.length > 0 ? users.map((listedUser) => {
              const isCurrentUser = listedUser._id === user?._id;

              return (
              <tr key={listedUser._id} className="transition-colors hover:bg-[#fcfbf9]">
                <td className="whitespace-nowrap px-5 py-4 font-medium text-[#292b25] sm:px-6">
                  {listedUser.name}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-[#55564f] sm:px-6">{listedUser.email}</td>
                <td className="px-5 py-4 sm:px-6">
                  <select
                    value={listedUser.role}
                    onChange={(e) => handleRoleChange(listedUser._id, e.target.value)}
                    aria-label={`Role for ${listedUser.name}`}
                    className="border border-[#dedbd3] bg-white px-3 py-2 text-xs text-[#41443b] outline-none focus:border-[#68725b] focus:ring-2 focus:ring-[#414b36]/10"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                  {isCurrentUser ? (
                    <span className="text-xs font-medium text-[#85847c]">You</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError("");
                        setUserToDelete(listedUser);
                      }}
                      className="text-xs font-semibold text-[#a94f38] hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            );
            }) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-[#85847c]">
                  {loading ? "Loading accounts…" : "No users found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </section>
      {userToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#171714]/45 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) {
              setUserToDelete(null);
              setDeleteError("");
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
            aria-describedby="delete-user-description"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto border border-[#e7e4dc] bg-white p-5 shadow-[0_24px_70px_rgba(23,23,20,0.2)] sm:p-6"
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a94f38]">
              Confirm deletion
            </p>
            <h2 id="delete-user-title" className="text-xl font-medium text-[#292b25]">
              Delete this user?
            </h2>
            <p id="delete-user-description" className="mt-2 text-sm leading-6 text-[#77766e]">
              “{userToDelete.name}” will be permanently removed from your customer directory.
            </p>
            {deleteError && (
              <p role="alert" className="mt-4 border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setUserToDelete(null);
                  setDeleteError("");
                }}
                disabled={isDeleting}
                className="min-h-11 border border-[#dedbd3] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#55564f] transition-colors hover:bg-[#faf9f6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="min-h-11 bg-[#a94f38] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#873c2a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting…" : "Delete user"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
