
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  Package,
} from "lucide-react";
import { useStockFlowStore } from "../../store/useStockFlowStore";

export default function LowStockAlerts() {
  const navigate = useNavigate();
  const inventory = useStockFlowStore((state) => state.inventory);

  const lowStockItems = inventory
    .filter((item) => item.stock <= item.threshold)
    .sort((a, b) => a.stock - b.stock);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Low Stock Alerts
            </h2>

            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600">
              {lowStockItems.length}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Products requiring stock replenishment
          </p>
        </div>

        <button
          onClick={() => navigate("/inventory")}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
        >
          View inventory
          <ArrowUpRight size={15} />
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {lowStockItems.map((item) => {
          const outOfStock = item.stock === 0;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-4 sm:p-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Package size={20} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {item.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {item.id} · {item.color} · Size {item.size}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="flex items-center justify-end gap-1">
                  <AlertTriangle
                    size={13}
                    className={
                      outOfStock ? "text-red-500" : "text-orange-500"
                    }
                  />

                  <span
                    className={`text-xs font-bold ${
                      outOfStock ? "text-red-600" : "text-orange-600"
                    }`}
                  >
                    {outOfStock ? "Out of stock" : `${item.stock} left`}
                  </span>
                </div>

                <p className="mt-1 text-[10px] text-slate-400">
                  Minimum: {item.threshold}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {lowStockItems.length === 0 && (
        <div className="p-8 text-center">
          <Package className="mx-auto mb-2 text-slate-300" size={28} />
          <p className="text-sm font-medium text-slate-600">
            All stock levels look good.
          </p>
        </div>
      )}
    </section>
  );
}
