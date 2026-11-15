import { useMemo, useState } from "react";
import { Package, Search, Plus, Pencil, Trash2, Boxes } from "lucide-react";

import { useStockFlowStore } from "../../store/useStockFlowStore";
import ProductModal from "../../components/products/ProductModal";
import DeleteProductModal from "../../components/products/DeleteProductModal";

export default function Products() {
  const products = useStockFlowStore((state) => state.products);
  const saveProduct = useStockFlowStore((state) => state.saveProduct);
  const deleteProduct = useStockFlowStore((state) => state.deleteProduct);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saveError, setSaveError] = useState("");

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.status === "Active",
  ).length;

  const inactiveProducts = products.filter(
    (product) => product.status === "Inactive",
  ).length;

  const totalVariants = products.reduce(
    (total, product) => total + product.variants.length,
    0,
  );

  const categories = [...new Set(products.map((product) => product.category))];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = search.toLowerCase();

      const matchesSearch = [
        product.name,
        product.category,
        product.description,
        ...product.variants.map((variant) => variant.sku),
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchText),
      );

      const matchesCategory =
        categoryFilter === "All" || product.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" || product.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const handleSaveProduct = (productData) => {
    const result = saveProduct(productData);

    if (!result.success) {
      setSaveError(result.error);
      return;
    }

    setSaveError("");
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (productId) => {
    deleteProduct(productId);
    setProductToDelete(null);
  };

  const openAddModal = () => {
    setSaveError("");
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setSaveError("");
    setSelectedProduct(product);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">Workspace / Products</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your wholesale product catalogue and variants.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {saveError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={<Package size={21} />}
          color="text-blue-600"
          background="bg-blue-50"
        />
        <StatCard
          title="Active Products"
          value={activeProducts}
          icon={<Boxes size={21} />}
          color="text-emerald-600"
          background="bg-emerald-50"
        />
        <StatCard
          title="Inactive Products"
          value={inactiveProducts}
          icon={<Package size={21} />}
          color="text-orange-600"
          background="bg-orange-50"
        />
        <StatCard
          title="Total Variants"
          value={totalVariants}
          icon={<Boxes size={21} />}
          color="text-violet-600"
          background="bg-violet-50"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            Product Catalogue
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            All products and their available variants.
          </p>
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or SKU..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Variants</th>
                <th className="px-5 py-4">Wholesale Price</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{product.id}</p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {product.category}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.variants.map((variant) => (
                        <span
                          key={variant.id}
                          title={variant.sku}
                          className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
                        >
                          {variant.color} / {variant.size}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      {product.variants.length} variants
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        product.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        title="Edit Product"
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => setProductToDelete(product)}
                        title="Delete Product"
                        className="rounded-lg border border-slate-200 p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-500">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
      </div>

      {modalOpen && (
        <ProductModal
          product={selectedProduct}
          onClose={() => {
            setModalOpen(false);
            setSelectedProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {productToDelete && (
        <DeleteProductModal
          product={productToDelete}
          onClose={() => setProductToDelete(null)}
          onConfirm={handleDeleteProduct}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color, background }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <div className={`rounded-xl p-3 ${background} ${color}`}>{icon}</div>
      </div>
      <h3 className="mt-4 text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  );
}
