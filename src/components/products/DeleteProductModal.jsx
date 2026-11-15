
import { AlertTriangle, X } from "lucide-react";

export default function DeleteProductModal({
  product,
  onClose,
  onConfirm,
}) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        <div className="flex items-start justify-between">
          <div className="rounded-xl bg-red-50 p-3 text-red-600">
            <AlertTriangle size={23} />
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-900">
          Delete Product?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <strong className="text-slate-800">
            {product.name}
          </strong>
          ? This removes it from the demo catalogue.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirm(product.id)}
            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete Product
          </button>
        </div>

      </div>
    </div>
  );
}
