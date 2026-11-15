import { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  district: "",
  status: "Active",
};

export default function StoreModal({
  isOpen,
  onClose,
  onSave,
  store,
}) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name || "",
        contactPerson: store.contactPerson || "",
        phone: store.phone || "",
        email: store.email || "",
        address: store.address || "",
        city: store.city || "",
        district: store.district || "",
        status: store.status || "Active",
      });
    } else {
      setForm(initialForm);
    }

    setError("");
  }, [store, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Store name is required.");
      return;
    }

    if (
      form.phone.trim() &&
      !/^[0-9+\-\s()]{7,15}$/.test(form.phone.trim())
    ) {
      setError("Enter a valid phone number.");
      return;
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      setError("Enter a valid email address.");
      return;
    }

    onSave(form);
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {store ? "Edit Store" : "Add New Store"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage store information and contact details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className={labelClass}>Store Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter store name"
              className={inputClass}
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Contact Person</label>
              <input
                name="contactPerson"
                value={form.contactPerson}
                onChange={handleChange}
                placeholder="Contact person's name"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="store@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>District</label>
              <input
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="District"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Full Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              placeholder="Enter complete store address"
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {store ? "Save Changes" : "Create Store"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}