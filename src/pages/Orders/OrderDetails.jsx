import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Store,
  CheckCircle2,
  AlertTriangle,
  Truck,
  ClipboardCheck,
  Boxes,
  Clock,
  XCircle,
} from "lucide-react";

import { mockOrderItems } from "../../data/mockOrderItems";
import { useStockFlowStore } from "../../store/useStockFlowStore";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDateTime = (value) => {
  if (!value) return "Not yet";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const orders = useStockFlowStore((state) => state.orders);
  const inventory = useStockFlowStore((state) => state.inventory);
  const reservations = useStockFlowStore((state) => state.reservations);
  const orderWorkflows = useStockFlowStore((state) => state.orderWorkflows);
  const dispatches = useStockFlowStore((state) => state.dispatches);

  const getAvailableStock = useStockFlowStore(
    (state) => state.getAvailableStock,
  );

  const approveOrder = useStockFlowStore((state) => state.approveOrder);
  const startPicking = useStockFlowStore((state) => state.startPicking);
  const completePacking = useStockFlowStore((state) => state.completePacking);
  const dispatchOrder = useStockFlowStore((state) => state.dispatchOrder);
  const cancelOrder = useStockFlowStore((state) => state.cancelOrder);

  const [approvedQuantities, setApprovedQuantities] = useState({});
  const [error, setError] = useState("");

  const order = orders.find((item) => item.id === orderId);
  const orderItems = mockOrderItems[orderId] || [];

  const workflow = orderWorkflows[orderId] || {};
  const reservation = reservations[orderId] || {};

  const dispatch = dispatches.find((item) => item.orderId === orderId);

  if (!order) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h2 className="text-lg font-bold text-slate-900">Order not found</h2>

        <button
          onClick={() => navigate("/orders")}
          className="mt-4 text-sm font-semibold text-blue-600"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const isApproved = Boolean(workflow.approvedAt);
  const isPicking = workflow.processingStatus === "Picking";
  const isPacked = workflow.processingStatus === "Packed";
  const isDispatched = Boolean(workflow.dispatchedAt);
  const isCancelled = order.status === "Cancelled";

  const canApprove = order.status === "Pending" && !isApproved;

  const orderItemsWithStock = orderItems.map((item) => {
    const inventoryItem = inventory.find((stock) => stock.sku === item.sku);

    // Exclude this order's own reservation so its reserved stock
    // does not appear unavailable to itself.
    const availableStock = getAvailableStock(item.sku, orderId);

    const approvedQty = isApproved
      ? workflow.approvedQuantities?.[item.id] || 0
      : approvedQuantities[item.id] || 0;

    return {
      ...item,
      inventoryId: inventoryItem?.id,
      availableStock,
      approvedQty,
      shortage: Math.max(item.requestedQty - availableStock, 0),
    };
  });

  const totalRequested = orderItemsWithStock.reduce(
    (total, item) => total + item.requestedQty,
    0,
  );

  const totalAvailable = orderItemsWithStock.reduce(
    (total, item) => total + Math.min(item.availableStock, item.requestedQty),
    0,
  );

  const totalShortage = orderItemsWithStock.reduce(
    (total, item) => total + item.shortage,
    0,
  );

  const totalApproved = orderItemsWithStock.reduce(
    (total, item) => total + item.approvedQty,
    0,
  );

  const totalRejected = totalRequested - totalApproved;
  const remainingUnits = totalRequested - totalApproved;

  const approvalAmount = orderItemsWithStock.reduce(
    (total, item) => total + item.approvedQty * item.unitPrice,
    0,
  );

  const displayedStatus = isCancelled
    ? "Cancelled"
    : isDispatched
      ? "Dispatched"
      : isPacked
        ? "Ready for Dispatch"
        : isPicking
          ? "Processing"
          : isApproved
            ? totalApproved < totalRequested
              ? "Partially Approved"
              : "Approved"
            : order.status;

  const handleApprovedQtyChange = (itemId, value, maxStock) => {
    const quantity = Math.max(0, Math.min(Number(value) || 0, maxStock));

    setApprovedQuantities((previous) => ({
      ...previous,
      [itemId]: quantity,
    }));

    setError("");
  };

  const handleSubmitApproval = () => {
    setError("");

    const quantities = {};

    orderItemsWithStock.forEach((item) => {
      quantities[item.id] = approvedQuantities[item.id] || 0;
    });

    const result = approveOrder(orderId, quantities);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setApprovedQuantities({});
  };

  const runWorkflowAction = (action) => {
    setError("");

    const result = action(orderId);

    if (!result.success) {
      setError(result.error);
    }
  };

  const handleCancelOrder = () => {
    const confirmed = window.confirm(
      "Cancel this order? Any reserved stock will be released.",
    );

    if (!confirmed) return;

    runWorkflowAction(cancelOrder);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/orders")}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Back to Orders
      </button>

      {/* Page heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">
            Workspace / Orders / {order.id}
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Order Details
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage approval, warehouse processing and dispatch.
          </p>
        </div>

        <span className="w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
          {displayedStatus}
        </span>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle size={19} className="mt-0.5 shrink-0 text-red-600" />

          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Order information */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <Store className="text-slate-500" />
            <h2 className="font-bold text-slate-900">Store Information</h2>
          </div>

          <p className="mt-5 font-semibold text-slate-800">{order.store}</p>

          <p className="mt-1 text-sm text-slate-500">
            {order.location}, Telangana
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <Package className="text-slate-500" />
            <h2 className="font-bold text-slate-900">Order Information</h2>
          </div>

          <div className="mt-5 space-y-2 text-sm text-slate-500">
            <p>
              Order ID: <strong className="text-slate-800">{order.id}</strong>
            </p>

            <p>
              Order Date:{" "}
              <strong className="text-slate-800">{order.date}</strong>
            </p>

            <p>
              Product Variants:{" "}
              <strong className="text-slate-800">{order.items}</strong>
            </p>

            <p>
              Original Amount:{" "}
              <strong className="text-slate-800">
                {formatCurrency(order.amount)}
              </strong>
            </p>

            <p>
              Status:{" "}
              <strong className="text-slate-800">{displayedStatus}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Requested Units"
          value={totalRequested}
          color="text-slate-900"
        />

        <SummaryCard
          title="Available Units"
          value={totalAvailable}
          color="text-emerald-600"
        />

        <SummaryCard
          title="Approved Units"
          value={totalApproved}
          color="text-blue-600"
        />

        <SummaryCard
          title="Shortage Units"
          value={totalShortage}
          color="text-red-600"
        />
      </div>

      {totalShortage > 0 && canApprove && (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="shrink-0 text-red-600" size={20} />

          <div>
            <p className="font-semibold text-red-700">Insufficient Stock</p>

            <p className="mt-1 text-sm text-red-600">
              {totalShortage} units are unavailable. You can approve partial
              quantities based on available stock.
            </p>
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Order Items</h2>

          <p className="mt-1 text-sm text-slate-500">
            Review stock and enter approved quantities.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Variant</th>
                <th className="px-5 py-3">Requested</th>
                <th className="px-5 py-3">Available</th>
                <th className="px-5 py-3">Approved</th>
                <th className="px-5 py-3">Shortage</th>
                <th className="px-5 py-3">Unit Price</th>
                <th className="px-5 py-3">Approved Total</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {orderItemsWithStock.map((item) => {
                const maxStock = Math.min(
                  item.availableStock,
                  item.requestedQty,
                );

                return (
                  <tr key={item.id}>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {item.product}

                      <p className="text-xs font-normal text-slate-500">
                        {item.category}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.sku}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.color} / {item.size}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.requestedQty}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {item.availableStock}
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="0"
                        max={maxStock}
                        step="1"
                        disabled={!canApprove}
                        value={
                          isApproved
                            ? item.approvedQty
                            : (approvedQuantities[item.id] ?? 0)
                        }
                        onChange={(event) =>
                          handleApprovedQtyChange(
                            item.id,
                            event.target.value,
                            maxStock,
                          )
                        }
                        className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </td>

                    <td className="px-5 py-4 text-sm">
                      <span
                        className={
                          item.shortage > 0
                            ? "font-semibold text-red-600"
                            : "text-emerald-600"
                        }
                      >
                        {item.shortage}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatCurrency(item.unitPrice)}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                      {formatCurrency(item.approvedQty * item.unitPrice)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-slate-200 p-5">
          <div className="space-y-2 text-right">
            <p className="text-sm text-slate-500">Original Items Subtotal</p>

            <p className="text-lg font-bold text-slate-900">
              {formatCurrency(
                orderItemsWithStock.reduce(
                  (total, item) => total + item.requestedQty * item.unitPrice,
                  0,
                ),
              )}
            </p>

            <p className="text-sm text-slate-500">Approved Value</p>

            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(approvalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Approval summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="text-slate-500" />

          <h2 className="text-lg font-bold text-slate-900">Approval Summary</h2>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MiniSummary title="Requested" value={totalRequested} />
          <MiniSummary title="Approved" value={totalApproved} />
          <MiniSummary title="Rejected / Remaining" value={totalRejected} />
          <MiniSummary title="Remaining" value={remainingUnits} />
        </div>

        <div className="mt-5 border-t border-slate-100 pt-5">
          {canApprove ? (
            <button
              onClick={handleSubmitApproval}
              disabled={totalApproved === 0}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
            >
              Confirm Approval
            </button>
          ) : isApproved ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
              <CheckCircle2 size={19} />
              Approval Confirmed
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              This order is not available for approval.
            </p>
          )}
        </div>
      </div>

      {/* Warehouse processing */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <Boxes className="text-slate-500" />

          <h2 className="text-lg font-bold text-slate-900">
            Warehouse Processing
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ProcessStep
            title="Approval"
            description={
              isApproved ? "Approval completed" : "Waiting for approval"
            }
            active={isApproved}
          />

          <ProcessStep
            title="Picking"
            description={
              isPicking || isPacked
                ? "Picking started"
                : "Waiting to pick products"
            }
            active={isPicking || isPacked}
          />

          <ProcessStep
            title="Packing"
            description={isPacked ? "Packing completed" : "Waiting for packing"}
            active={isPacked}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => runWorkflowAction(startPicking)}
            disabled={
              !isApproved ||
              workflow.processingStatus !== "Not Started" ||
              isCancelled
            }
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Start Picking
          </button>

          <button
            onClick={() => runWorkflowAction(completePacking)}
            disabled={!isPicking || isCancelled}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Complete Packing
          </button>
        </div>
      </div>

      {/* Dispatch */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <Truck className="text-slate-500" />

          <h2 className="text-lg font-bold text-slate-900">
            Dispatch Information
          </h2>
        </div>

        {dispatch && (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MiniSummary title="Dispatch ID" value={dispatch.id} />
            <MiniSummary title="Items" value={dispatch.items ?? "—"} />
            <MiniSummary title="Dispatch Date" value={dispatch.date} />
            <MiniSummary title="Status" value={dispatch.status} />
          </div>
        )}

        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">
            Current Dispatch Status
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {workflow.dispatchStatus || "Not Dispatched"}
          </p>
        </div>

        <button
          onClick={() => runWorkflowAction(dispatchOrder)}
          disabled={!isPacked || isDispatched || isCancelled}
          className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Mark as Dispatched
        </button>
      </div>

      {/* Activity timeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <Clock className="text-slate-500" />

          <h2 className="text-lg font-bold text-slate-900">Order Activity</h2>
        </div>

        <div className="mt-6 space-y-5">
          <TimelineItem
            title="Order Received"
            description={`Order ${order.id} received from ${order.store}`}
            completed
          />

          <TimelineItem
            title="Approval"
            description={
              isApproved
                ? `Manager approved ${totalApproved} of ${totalRequested} units · ${formatDateTime(workflow.approvedAt)}`
                : "Waiting for manager approval"
            }
            completed={isApproved}
          />

          <TimelineItem
            title="Picking"
            description={
              workflow.pickingStartedAt
                ? `Picking started · ${formatDateTime(workflow.pickingStartedAt)}`
                : "Waiting for picking"
            }
            completed={Boolean(workflow.pickingStartedAt)}
          />

          <TimelineItem
            title="Packing"
            description={
              workflow.packedAt
                ? `Packing completed · ${formatDateTime(workflow.packedAt)}`
                : "Waiting for packing"
            }
            completed={Boolean(workflow.packedAt)}
          />

          <TimelineItem
            title="Dispatch"
            description={
              workflow.dispatchedAt
                ? `Dispatched · ${formatDateTime(workflow.dispatchedAt)}`
                : "Waiting for dispatch"
            }
            completed={isDispatched}
          />

          {isCancelled && (
            <TimelineItem
              title="Cancelled"
              description={`Order cancelled · ${formatDateTime(workflow.cancelledAt)}`}
              completed
              danger
            />
          )}
        </div>
      </div>

      {/* Cancellation */}
      {!isCancelled && ["Pending", "Approved"].includes(order.status) && (
        <div className="flex justify-end">
          <button
            onClick={handleCancelOrder}
            className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <XCircle size={17} />
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{title}</p>

      <h3 className={`mt-2 text-2xl font-bold ${color}`}>{value}</h3>
    </div>
  );
}

function MiniSummary({ title, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{title}</p>

      <p className="mt-1 break-words text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function ProcessStep({ title, description, active }) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 p-4">
      <CheckCircle2
        size={20}
        className={
          active ? "shrink-0 text-emerald-500" : "shrink-0 text-slate-300"
        }
      />

      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function TimelineItem({ title, description, completed, danger = false }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`h-3 w-3 rounded-full ${
            danger
              ? "bg-red-500"
              : completed
                ? "bg-emerald-500"
                : "bg-slate-300"
          }`}
        />

        <div className="mt-1 h-8 w-px bg-slate-200" />
      </div>

      <div className="-mt-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>

        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}
