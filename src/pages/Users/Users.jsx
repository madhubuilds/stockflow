import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Power, Users, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { useStockFlowStore } from "../../store/useStockFlowStore";

const ROLES = ["Admin", "Manager", "Warehouse Staff", "Viewer"];
const emptyForm = { name: "", email: "", phone: "", role: "Warehouse Staff", status: "Active" };

export default function UsersPage() {
  const users = useStockFlowStore((s) => s.users);
  const currentRole = useStockFlowStore((s) => s.currentRole);
  const setCurrentRole = useStockFlowStore((s) => s.setCurrentRole);
  const saveUser = useStockFlowStore((s) => s.saveUser);
  const toggleUserStatus = useStockFlowStore((s) => s.toggleUserStatus);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = currentRole === "Admin";
  const filtered = useMemo(() => users.filter((u) => {
    const q = search.toLowerCase();
    const matches = [u.name, u.email, u.phone, u.role].join(" ").toLowerCase().includes(q);
    return matches && (roleFilter === "All" || u.role === roleFilter);
  }), [users, search, roleFilter]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (user) => {
    setEditing(user);
    setForm({ name: user.name || "", email: user.email || "", phone: user.phone || "", role: user.role, status: user.status });
    setError("");
    setModalOpen(true);
  };

  const submit = (e) => {
    e.preventDefault();
    const result = saveUser({ ...form, id: editing?.id });
    if (!result.success) { setError(result.error); return; }
    setModalOpen(false);
  };

  const toggleStatus = (user) => {
    const result = toggleUserStatus(user.id);
    if (!result.success) window.alert(result.error);
  };

  const active = users.filter((u) => u.status === "Active").length;
  const inactive = users.length - active;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users & Access</h1>
          <p className="mt-1 text-sm text-slate-500">Manage team members and their demo access roles.</p>
        </div>
        <button onClick={openCreate} disabled={!isAdmin} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Demo role switcher: changing this role simulates a different user. It is not authentication or production security.
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Current demo role</p>
            <p className="mt-1 text-xs text-slate-500">Choose a role to preview its intended access.</p>
          </div>
          <select value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500">
            {ROLES.map((role) => <option key={role}>{role}</option>)}
          </select>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {currentRole === "Admin" ? "Full demo access, including user and settings management." :
           currentRole === "Manager" ? "Intended access: orders, inventory, stores and dispatch operations." :
           currentRole === "Warehouse Staff" ? "Intended access: picking, packing and dispatch tasks." :
           "Read-only preview. Editing controls on this page are disabled."}
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric title="Total Users" value={users.length} icon={<Users size={20} />} />
        <Metric title="Active Users" value={active} icon={<UserCheck size={20} />} />
        <Metric title="Inactive Users" value={inactive} icon={<UserX size={20} />} />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone..." className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm">
          <option>All</option>{ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Team members</h2>
          <p className="mt-1 text-sm text-slate-500">{filtered.length} users found</p>
        </div>
        {filtered.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">No users match your search.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-5 py-4">User</th><th className="px-5 py-4">Phone</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4"><p className="font-medium text-slate-900">{user.name}</p><p className="mt-1 text-xs text-slate-500">{user.email}</p></td>
                    <td className="px-5 py-4 text-sm text-slate-600">{user.phone || "—"}</td>
                    <td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"><ShieldCheck size={13} />{user.role}</span></td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{user.status}</span></td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(user)} disabled={!isAdmin} title="Edit user" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><Pencil size={16} /></button>
                      <button onClick={() => toggleStatus(user)} disabled={!isAdmin} title="Toggle status" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><Power size={16} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form onSubmit={submit} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
            <div><h2 className="text-xl font-bold text-slate-900">{editing ? "Edit User" : "Add User"}</h2><p className="mt-1 text-sm text-slate-500">Set the user's contact details and role.</p></div>
            <Field label="Full name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></Field>
            <Field label="Email"><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} /></Field>
            <Field label="Phone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} /></Field>
            <Field label="Role"><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}><option>Active</option><option>Inactive</option></select></Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm">Cancel</button><button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">{editing ? "Save Changes" : "Create User"}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500";
function Field({ label, children }) { return <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>{children}</label>; }
function Metric({ title, value, icon }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{title}</p><span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">{icon}</span></div><p className="mt-4 text-2xl font-bold text-slate-900">{value}</p></div>;
}
