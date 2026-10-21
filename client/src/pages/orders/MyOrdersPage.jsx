import React, { useEffect, useState } from "react";
import {
  Package,
  Truck,
  FileText,
  ArrowRight,
  RotateCw,
  ShoppingBag,
  MapPin,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import LoaderScreen from "../../components/common/Loader";
import orderService from "../../services/orderService";
import { logoutUser } from "../../features/auth/authSlice";

const FILTER_TABS = [
  "All Orders",
  "Pending",
  "Confirmed",
  "Delivered",
  "Cancelled",
];

const STATUS_META = {
  pending: { label: "Pending", variant: "warning", timelineStep: 1 },
  confirmed: { label: "Confirmed", variant: "info", timelineStep: 2 },
  delivered: { label: "Delivered", variant: "success", timelineStep: 3 },
  cancelled: { label: "Cancelled", variant: "danger", timelineStep: 0 },
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatMoney = (value) => {
  const n = Number(value ?? 0);
  return `₹${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
};

export default function MyOrdersPage({ onNavigate }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Orders");

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

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["my-orders", user?.token],
    queryFn: () => orderService.getMyOrders(user?.token),
    enabled: !!user?.token,
    retry: false,
  });

  const statusCode = error?.response?.status;
  const isSessionExpired = statusCode === 401;

  useEffect(() => {
    if (isSessionExpired) {
      localStorage.removeItem("user");
      dispatch(logoutUser());
      navigate("/login");
    }
  }, [isSessionExpired, dispatch, navigate]);

  const normalized = (orders ?? []).map((order) => {
    const key = String(order?.status ?? "pending").toLowerCase();
    const meta = STATUS_META[key] ?? STATUS_META.pending;
    const product = order?.product ?? null;
    const price = Number(product?.price ?? 0);
    return {
      _id: order?._id,
      displayId: order?._id
        ? `ORD-${String(order._id).slice(-6).toUpperCase()}`
        : "ORD-—",
      date: formatDate(order?.createdAt),
      total: Number.isFinite(price) ? price : 0,
      status: meta.label,
      statusKey: key,
      statusVariant: meta.variant,
      timelineStep: meta.timelineStep,
      productName: product?.name ?? "Product no longer available",
      productPrice: Number.isFinite(price) ? price : 0,
      productImage: product?.image ?? "",
      productDescription: product?.description ?? "",
    };
  });

  const displayedOrders = normalized.filter((ord) => {
    if (activeTab === "All Orders") return true;
    return ord.status.toLowerCase() === activeTab.toLowerCase();
  });

  if (isLoading) {
    return <LoaderScreen />;
  }

  if (isError && !isSessionExpired) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <Badge variant="info" size="sm" className="mb-1">
            Medicine Dispatch & History
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Medicine Orders
          </h1>
        </div>
        <Card className="p-12 text-center max-w-lg mx-auto border-dashed border-2 border-slate-200 space-y-4">
          <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <Package className="w-10 h-10 stroke-1" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">
              Could not load your orders
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {error?.response?.data?.message ||
                error?.message ||
                "Something went wrong while fetching your orders."}
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => refetch()}
              icon={RotateCw}
              disabled={isRefetching}>
              {isRefetching ? "Retrying…" : "Retry"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="info" size="sm" className="mb-1">
            Medicine Dispatch & History
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Medicine Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time fulfillment tracking, digital invoices, and prescription
            logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => go("/pharmacy", "pharmacy")}
            icon={ShoppingBag}>
            Order Medicines
          </Button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}>
              {tab}
            </button>
          );
        })}
      </div>

      {/* Orders List or Empty State */}
      {displayedOrders.length === 0 ? (
        /* Empty State Illustration Area */
        <Card className="p-12 text-center max-w-lg mx-auto border-dashed border-2 border-slate-200 space-y-4">
          <div className="w-20 h-20 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
            <Package className="w-10 h-10 stroke-1" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">
              No Orders Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {normalized.length === 0
                ? "You haven't placed any medicine orders yet. Find authentic medicines with doorstep express dispatch."
                : "No orders match this filter. Try a different status."}
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => go("/pharmacy", "pharmacy")}
              icon={ArrowRight}
              iconPosition="right">
              Explore MediTrust Pharmacy
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {displayedOrders.map((order) => (
            <Card
              key={order._id}
              className="p-6 border-slate-200/90 shadow-sm space-y-6">
              {/* Order Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="font-bold text-slate-900 text-base"
                    title={order._id}>
                    {order.displayId}
                  </span>
                  <span className="text-xs text-slate-400">
                    • Placed on {order.date}
                  </span>
                  <Badge variant={order.statusVariant} size="sm" dot>
                    {order.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">
                      Total Amount
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      {formatMoney(order.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Tracker (Timeline steps) */}
              {order.status !== "Cancelled" && (
                <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                    <span
                      className={
                        order.timelineStep >= 1 ? "text-teal-700" : ""
                      }>
                      Order Placed
                    </span>
                    <span
                      className={
                        order.timelineStep >= 2 ? "text-teal-700" : ""
                      }>
                      Confirmed
                    </span>
                    <span
                      className={
                        order.timelineStep >= 3 ? "text-teal-700" : ""
                      }>
                      Delivered
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(order.timelineStep / 3) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Truck className="w-3.5 h-3.5 text-teal-600" />
                      Status:{" "}
                      <strong className="text-slate-800">{order.status}</strong>
                    </span>
                    <span>Order ID: {order.displayId}</span>
                  </div>
                </div>
              )}

              {/* Item Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      {order.productImage ? (
                        <img
                          src={order.productImage}
                          alt={order.productName}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {order.productName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>Qty: 1</span>
                        <span>•</span>
                        <span>{formatMoney(order.productPrice)} each</span>
                      </div>
                      {order.productDescription ? (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {order.productDescription}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <span className="font-bold text-slate-800 text-sm">
                    {formatMoney(order.productPrice)}
                  </span>
                </div>
              </div>

              {/* Order Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Delivering to: {user?.address || "—"}</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" icon={FileText}>
                    Invoice
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => go("/pharmacy", "pharmacy")}
                    icon={RotateCw}>
                    Reorder
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
