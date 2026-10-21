import React, { useEffect, useState } from "react";
import {
  Users,
  Stethoscope,
  ShoppingBag,
  DollarSign,
  Search,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import AddProductModal from "./AddProductModal";
import VerificationModal from "./VerificationModal";
import adminService from "../../services/adminService";
import toast from "react-hot-toast";
import LoaderScreen from "../../components/common/Loader";
import AdminSidebar, { buildAdminCounts } from "../../components/admin/AdminSidebar";
import { logoutUser } from "../../features/auth/authSlice";

const AVAILABILITY_FILTERS = [
  { id: "all", label: "All Products" },
  { id: "in-stock", label: "In Stock" },
  { id: "out-of-stock", label: "Out of Stock" },
  { id: "inactive", label: "Inactive" },
];

export default function AdminDashboardPage({ onNavigate }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeSection] = useState("products");
  const [searchText, setSearchText] = useState("");
  const [availability, setAvailability] = useState("all");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [verificationTarget, setVerificationTarget] = useState(null);

  const go = (route, legacyId) => {
    if (typeof onNavigate === "function" && legacyId) {
      try {
        onNavigate(legacyId);
      } catch {
        // ignore legacy demo navigator errors
      }
    }
    navigate(route);
  };

  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminService.fetchAdminData(user?.token),
    enabled: !!user?.token,
  });

  const handleAuthError = (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("user");
      dispatch(logoutUser());
      navigate("/login");
      return true;
    }
    return false;
  };

  const refreshProducts = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    // Keep the public Pharmacy catalog in sync with the latest saved data.
    queryClient.invalidateQueries({ queryKey: ["items"] });
  };

  const deleteMutation = useMutation({
    mutationFn: (productId) =>
      adminService.deleteProduct({ token: user?.token, productId }),
    onSuccess: (result) => {
      toast.success(
        result?.message ||
          (result?.softDeleted
            ? "Product deactivated to preserve order history."
            : "Product deleted successfully."),
      );
      setDeletingProduct(null);
      refreshProducts();
    },
    onError: (err) => {
      if (handleAuthError(err)) return;
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Could not delete the product.",
      );
    },
    onSettled: () => setIsDeleting(false),
  });

  const verifiedDoctors =
    data?.doctors?.filter((doc) => doc.isVerified).length ?? 0;
  const verifiedPathologists =
    data?.pathologists?.filter((path) => path.isVerified).length ?? 0;
  const totalOrders = data?.orders?.length ?? 0;

  const MOCK_STATS = [
    {
      id: "revenue",
      label: "Total Revenue",
      value: "₹184,500",
      change: "+14.2% vs last month",
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      id: "orders",
      label: "Total Orders",
      value: totalOrders,
      change: "+8.1% vs last month",
      icon: ShoppingBag,
      color: "text-teal-600 bg-teal-50",
    },
    {
      id: "doctors",
      label: "Verified Doctors",
      value: verifiedDoctors,
      change: "+24 new this week",
      icon: Stethoscope,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      id: "pathologists",
      label: "Verified Pathologists",
      value: verifiedPathologists,
      change: "+24 new this week",
      icon: Stethoscope,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      id: "users",
      label: "Total Registered Users",
      value: data?.users?.length ?? 0,
      change: "+18.5% year-to-date",
      icon: Users,
      color: "text-sky-600 bg-sky-50",
    },
  ];

  useEffect(() => {
    if (isError && error) {
      if (handleAuthError(error)) return;
      toast.error(error.response?.data?.message || error.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, error, data, isSuccess]);

  const handleSaved = (saved) => {
    toast.success(
      saved?._id && editingProduct
        ? "Product updated successfully."
        : "Product added to catalog.",
    );
    setIsAddProductOpen(false);
    setEditingProduct(null);
    refreshProducts();
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct || isDeleting) return;
    setIsDeleting(true);
    deleteMutation.mutate(deletingProduct._id);
  };

  if (isLoading) {
    return <LoaderScreen />;
  }

  const allProducts = data?.products ?? [];
  const filteredProducts = allProducts.filter((row) => {
    const matchesSearch =
      !searchText.trim() ||
      String(row.name ?? "")
        .toLowerCase()
        .includes(searchText.trim().toLowerCase());
    if (!matchesSearch) return false;
    if (availability === "in-stock")
      return row.isActive !== false && Number(row.stock ?? 0) > 0;
    if (availability === "out-of-stock")
      return row.isActive !== false && Number(row.stock ?? 0) <= 0;
    if (availability === "inactive") return row.isActive === false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar counts={buildAdminCounts(data)} />

      {/* Main Admin Area */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-x-hidden">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 capitalize">
              ADMIN OVERVIEW
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live hospital operations, verification workflows, and
              pharmaceutical stock control.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeSection === "products" && (
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setEditingProduct(null);
                  setIsAddProductOpen(true);
                }}>
                Add New Product
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => go("/", "landing")}>
              Exit to Patient Portal
            </Button>
          </div>
        </div>

        {/* Top 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MOCK_STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.id} className="p-5 border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    {stat.label}
                  </span>
                  <div className={`p-2 rounded-xl ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-900">
                    {stat.value}
                  </span>
                  <p className="text-[11px] text-teal-700 font-semibold mt-1">
                    {stat.change}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Table Container Card */}
        <Card className="p-6 border-slate-200 shadow-xs space-y-4">
          {/* Table Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search products by name..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 bg-white focus:outline-none focus:border-teal-500"
                title="Filter by availability">
                {AVAILABILITY_FILTERS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DYNAMIC DATA TABLE BY SECTION */}
          <div className="overflow-x-auto">
            {/* 1. PRODUCTS TABLE */}
            {activeSection === "products" &&
              (filteredProducts.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <p className="text-sm font-bold text-slate-800">
                    {allProducts.length === 0
                      ? "No products in catalog yet"
                      : "No products match your search"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {allProducts.length === 0
                      ? "Add your first product to populate the Pharmacy catalog."
                      : "Try a different name or availability filter."}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-8">Stock</th>
                      <th className="py-3 px-10">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((row) => {
                      const inStock =
                        row.isActive !== false && Number(row.stock ?? 0) > 0;
                      return (
                        <tr
                          key={row._id}
                          className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {row.name}
                            {row.isActive === false && (
                              <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">{row.description}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            ₹{Number(row.price ?? 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-6">{row.stock} units</td>

                          <td className="py-3 px-4">
                            <Badge
                              variant={inStock ? "success" : "danger"}
                              size="sm"
                              dot>
                              {row.isActive === false
                                ? "INACTIVE"
                                : inStock
                                  ? "IN-STOCK"
                                  : "OUT-OF-STOCK"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                                title="Edit"
                                onClick={() => {
                                  setEditingProduct(row);
                                  setIsAddProductOpen(true);
                                }}>
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                className="p-1 hover:bg-rose-50 rounded text-rose-600"
                                title="Delete"
                                onClick={() => setDeletingProduct(row)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ))}
          </div>
        </Card>
      </main>

      {/* MODAL: ADD / EDIT PRODUCT */}
      <AddProductModal
        isOpen={isAddProductOpen}
        initialProduct={editingProduct}
        onClose={() => {
          setIsAddProductOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaved}
      />

      {/* MODAL: DELETE CONFIRMATION */}
      <Modal
        isOpen={!!deletingProduct}
        onClose={() => !isDeleting && setDeletingProduct(null)}
        title="Delete Product"
        subtitle="This action needs your confirmation"
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setDeletingProduct(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isDeleting}
              onClick={handleConfirmDelete}>
              {isDeleting ? "Deleting…" : "Delete Product"}
            </Button>
          </>
        }>
        <div className="space-y-2 text-xs text-slate-600">
          <p>
            Delete{" "}
            <strong className="text-slate-900">{deletingProduct?.name}</strong>{" "}
            from the catalog?
          </p>
          <p className="text-slate-500">
            Products referenced by existing orders are deactivated instead of
            deleted, so order history and records are always preserved.
          </p>
        </div>
      </Modal>

      {/* MODAL: DOCTOR / PATHOLOGIST VERIFICATION */}
      <VerificationModal
        isOpen={!!verificationTarget}
        onClose={() => setVerificationTarget(null)}
        item={verificationTarget}
        type={verificationTarget?.type}
        onApprove={() => setVerificationTarget(null)}
        onReject={() => setVerificationTarget(null)}
      />
    </div>
  );
}
