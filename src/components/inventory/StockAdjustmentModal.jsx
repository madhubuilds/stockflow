
import { useState } from "react";
import { X, Package, Plus, Minus } from "lucide-react";

export default function StockAdjustmentModal({
  item,
  onClose,
  onSave,
}) {
  const [newStock, setNewStock] = useState(String(item.stock));
  const [reason, setReason] = useState("Stock correction");

  const handleSubmit = (e) => {
    e.preventDefault();

    const quantity = Number(newStock);

    if (!Number.isInteger(quantity) || quantity < 0) {
      return;
    }

    onSave(item.id, quantity, reason);
    onClose();
  };

  const difference = Number(newStock) - item.stock;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Adjust Stock
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update inventory quantity
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">

          {/* Product */}
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white p-3">
                <Package size={22} className="text-slate-600" />
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  {item.product}
                </p>
                <p className="text-xs text-slate-500">
                  {item.sku} · {item.color} · {item.size}
                </p>
              </div>
            </div>
          </div>

          {/* Current stock */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Current Stock
            </label>

            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700">
              {item.stock} units
            </div>
          </div>

          {/* New stock */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              New Stock Quantity
            </label>

            <input
              type="number"
              min="0"
              step="1"
              required
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-2 flex items-center gap-2 text-sm">
              {difference > 0 ? (
                <>
                  <Plus size={15} className="text-emerald-600" />
                  <span className="font-medium text-emerald-600">
                    Stock will increase by {difference} units
                  </span>
                </>
              ) : difference < 0 ? (
                <>
                  <Minus size={15} className="text-red-600" />
                  <span className="font-medium text-red-600">
                    Stock will decrease by {Math.abs(difference)} units
                  </span>
                </>
              ) : (
                <span className="text-slate-500">
                  No quantity change
                </span>
              )}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Adjustment Reason
            </label>

            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option>Stock correction</option>
              <option>New stock received</option>
              <option>Damaged goods</option>
              <option>Returned goods</option>
              <option>Manual adjustment</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                newStock.trim() === "" ||
                !Number.isInteger(Number(newStock)) ||
                Number(newStock) < 0
              }
              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Save Adjustment
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
