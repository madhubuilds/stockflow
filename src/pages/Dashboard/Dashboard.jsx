import { ShoppingBag, Clock3, Package, AlertTriangle } from "lucide-react";

import DashboardGreeting from "./DashboardGreeting";
import RecentOrders from "../../components/common/RecentOrders";
import LowStockAlerts from "../../components/common/LowStockAlerts";
import RecentDispatches from "../../components/common/RecentDispatches";
import OrderActivity from "../../components/common/OrderActivity";

import { useStockFlowStore } from "../../store/useStockFlowStore";

export default function Dashboard() {
  const orders = useStockFlowStore((state) => state.orders);
  const products = useStockFlowStore((state) => state.products);
  const inventory = useStockFlowStore((state) => state.inventory);

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending",
  ).length;

  const lowStockVariants = inventory.filter(
    (item) => item.stock > 0 && item.stock <= item.threshold,
  ).length;

  const stats = [
    {
      title: "Total Orders",
      value: orders.length,
      change: "All received orders",
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      change: "Needs attention",
      icon: Clock3,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Total Products",
      value: products.length,
      change: "Across all categories",
      icon: Package,
      color: "bg-violet-50 text-violet-600",
    },
    {
      title: "Low Stock Variants",
      value: lowStockVariants,
      change: "Requires stock review",
      icon: AlertTriangle,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-8">
      <DashboardGreeting />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={21} />
                </div>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {stat.title}
              </p>

              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </h2>

                <span className="text-xs font-medium text-slate-400">
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <RecentOrders />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LowStockAlerts />
        <RecentDispatches />
      </div>

      <OrderActivity />
    </div>
  );
}
