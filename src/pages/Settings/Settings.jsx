import { useEffect, useState } from "react";
import { Building2, Package, ClipboardList, Truck, Save, RotateCcw } from "lucide-react";
import { useStockFlowStore } from "../../store/useStockFlowStore";

export default function Settings() {
  const settings = useStockFlowStore((s) => s.settings);
  const currentRole = useStockFlowStore((s) => s.currentRole);
  const updateSettings = useStockFlowStore((s) => s.updateSettings);
  const resetDemoData = useStockFlowStore((s) => s.resetDemoData);
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const change = (section, field, value) => {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    setSaved(false);
  };

  const save = () => {
    updateSettings(form);
    setSaved(true);
  };

  const reset = () => {
    const ok = window.confirm("Reset all StockFlow demo data? This will reset products, inventory, orders, stores, users, dispatches and settings.");
    if (ok) resetDemoData();
  };

  const admin = currentRole === "Admin";

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Settings</h1><p className="mt-1 text-sm text-slate-500">Configure your wholesale business and StockFlow demo preferences.</p></div>
      {!admin && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Settings are read-only in the current demo role. Switch to Admin in Users & Access to edit them.</div>}

      <Section icon={<Building2 size={19} />} title="Business Profile" description="Basic details for your wholesale godown.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Business name" value={form.business.name} disabled={!admin} onChange={(v) => change("business", "name", v)} />
          <Input label="Business email" value={form.business.email} disabled={!admin} onChange={(v) => change("business", "email", v)} />
          <Input label="Phone" value={form.business.phone} disabled={!admin} onChange={(v) => change("business", "phone", v)} />
          <Input label="City" value={form.business.city} disabled={!admin} onChange={(v) => change("business", "city", v)} />
          <Input label="State" value={form.business.state} disabled={!admin} onChange={(v) => change("business", "state", v)} />
          <Input label="PIN code" value={form.business.pincode} disabled={!admin} onChange={(v) => change("business", "pincode", v)} />
          <div className="sm:col-span-2"><Input label="Address" value={form.business.address} disabled={!admin} onChange={(v) => change("business", "address", v)} /></div>
        </div>
      </Section>

      <Section icon={<Package size={19} />} title="Inventory Settings" description="Default stock behaviour for new inventory records.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Default low-stock threshold" type="number" min="0" value={form.inventory.defaultLowStockThreshold} disabled={!admin} onChange={(v) => change("inventory", "defaultLowStockThreshold", Math.max(0, Number(v)))} />
          <Toggle label="Allow negative stock" checked={form.inventory.allowNegativeStock} disabled={!admin} onChange={(v) => change("inventory", "allowNegativeStock", v)} />
        </div>
        <p className="mt-3 text-xs text-slate-500">Changing the default threshold affects future variants only. Existing inventory thresholds are not overwritten.</p>
      </Section>

      <Section icon={<ClipboardList size={19} />} title="Order Settings" description="Define how orders move through approval.">
        <div className="space-y-3">
          <Toggle label="Allow partial order approval" checked={form.orders.allowPartialApproval} disabled={!admin} onChange={(v) => change("orders", "allowPartialApproval", v)} />
          <Toggle label="Require approval before picking" checked={form.orders.requireApprovalBeforePicking} disabled={!admin} onChange={(v) => change("orders", "requireApprovalBeforePicking", v)} />
        </div>
      </Section>

      <Section icon={<Truck size={19} />} title="Dispatch Settings" description="Warehouse dispatch workflow preferences.">
        <Toggle label="Require packing before dispatch" checked={form.dispatch.requirePackingBeforeDispatch} disabled={!admin} onChange={(v) => change("dispatch", "requirePackingBeforeDispatch", v)} />
        <p className="mt-3 text-xs text-slate-500">These settings are stored for the demo. The current order workflow still enforces packing before dispatch.</p>
      </Section>

      <Section icon={<RotateCcw size={19} />} title="Demo Data" description="Reset the local demo to its initial sample data.">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-600">This cannot be undone. All locally saved demo changes will be lost.</p>
          <button onClick={reset} disabled={!admin} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40">Reset Demo Data</button>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm font-medium text-emerald-600">Settings saved.</span>}
        <button onClick={save} disabled={!admin} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"><Save size={17} /> Save Settings</button>
      </div>
    </div>
  );
}

function Section({ icon, title, description, children }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-5 flex items-start gap-3"><span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">{icon}</span><div><h2 className="font-semibold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div></div>{children}</section>;
}
function Input({ label, value, onChange, disabled, type = "text", min }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span><input type={type} min={min} value={value ?? ""} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500" /></label>;
}
function Toggle({ label, checked, onChange, disabled }) {
  return <label className="flex items-center justify-between gap-4"><span className="text-sm text-slate-700">{label}</span><button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-indigo-600" : "bg-slate-300"} disabled:opacity-50`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} /></button></label>;
}
