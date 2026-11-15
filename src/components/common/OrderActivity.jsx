
import { Activity } from "lucide-react";
import { useStockFlowStore } from "../../store/useStockFlowStore";

const statusStyles = [
  { status: "Pending", color: "bg-orange-500" },
  { status: "Approved", color: "bg-blue-500" },
  { status: "Processing", color: "bg-violet-500" },
  { status: "Dispatched", color: "bg-emerald-500" },
];

export default function OrderActivity() {
  const orders = useStockFlowStore((state) => state.orders);

  const totalOrders = orders.length;

  const activity = statusStyles.map((item) => {
    const count = orders.filter(
      (order) => order.status === item.status
    ).length;

    const percentage =
      totalOrders > 0 ? (count / totalOrders) * 100 : 0;

    return {
      ...item,
      count,
      percentage,
    };
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Activity size={18} />
            </div>

            <h2 className="text-base font-bold text-slate-900">
              Order Activity
            </h2>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Current order status overview
          </p>
        </div>

        <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
          Live data
        </span>
      </div>

      <div className="space-y-5">
        {activity.map((item) => (
          <div key={item.status}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">
                {item.status}
              </span>

              <span className="text-sm font-bold text-slate-900">
                {item.count}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <p className="text-xs leading-relaxed text-slate-400">
          {totalOrders} total orders across all processing stages.
        </p>
      </div>
    </section>
  );
}
