import React, { useEffect, useState } from "react";
import {
  User,
  Package,
  Calendar,
  FlaskConical,
  FileText,
  Settings,
  Camera,
  Mail,
  Phone,
  Heart,
  ShieldCheck,
  Download,
  Bell,
  KeyRound,
  Save,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Tabs from "../../components/common/Tabs";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import authService from "../../services/authService";
import dashboardService from "../../services/dashboardService";
import LoaderScreen from "../../components/common/Loader";
import { getProfile, logoutUser } from "../../features/auth/authSlice";
import toast from "react-hot-toast";
import ProfileFrom from "../../components/ProfileFrom";

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

const orderStatusMeta = (status) => {
  switch (String(status ?? "pending").toLowerCase()) {
    case "confirmed":
      return { label: "Confirmed", variant: "info" };
    case "delivered":
      return { label: "Delivered", variant: "success" };
    case "cancelled":
      return { label: "Cancelled", variant: "danger" };
    default:
      return { label: "Pending", variant: "warning" };
  }
};

const appointmentStatusMeta = (status) => {
  switch (String(status ?? "pending").toLowerCase()) {
    case "confirmed":
      return { label: "Confirmed", variant: "success" };
    case "cancelled":
      return { label: "Cancelled", variant: "danger" };
    default:
      return { label: "Pending", variant: "warning" };
  }
};

const labStatusMeta = (status) => {
  switch (String(status ?? "pending").toLowerCase()) {
    case "delivered":
      return { label: "Delivered", variant: "success" };
    case "cancelled":
      return { label: "Cancelled", variant: "danger" };
    default:
      return { label: "Pending", variant: "warning" };
  }
};

export default function UserDashboardPage({ onNavigate }) {
  const { user } = useSelector((state) => state.auth);

  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: ["user", user?.token],
    queryFn: () => authService.getMyProfile(user?.token),
    enabled: !!user?.token,
    retry: false,
  });

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
    refetch: refetchSummary,
    isRefetching: isSummaryRefetching,
  } = useQuery({
    queryKey: ["dashboard-summary", user?.token],
    queryFn: () => dashboardService.getSummary(user?.token),
    enabled: !!user?.token,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["dashboard-orders", user?.token],
    queryFn: () => dashboardService.getMyOrders(user?.token),
    enabled: !!user?.token && activeTab === "orders",
    retry: false,
  });

  const {
    data: appointments = [],
    isLoading: isAppointmentsLoading,
    isError: isAppointmentsError,
    error: appointmentsError,
    refetch: refetchAppointments,
  } = useQuery({
    queryKey: ["dashboard-appointments", user?.token],
    queryFn: () => dashboardService.getMyDoctorAppointments(user?.token),
    enabled: !!user?.token && activeTab === "appointments",
    retry: false,
  });

  const {
    data: labBookings = [],
    isLoading: isLabLoading,
    isError: isLabError,
    error: labError,
    refetch: refetchLab,
  } = useQuery({
    queryKey: ["dashboard-lab", user?.token],
    queryFn: () => dashboardService.getMyLabAppointments(user?.token),
    enabled: !!user?.token && activeTab === "lab",
    retry: false,
  });

  const {
    data: prescriptions = [],
    isLoading: isPrescriptionsLoading,
    isError: isPrescriptionsError,
    error: prescriptionsError,
    refetch: refetchPrescriptions,
  } = useQuery({
    queryKey: ["dashboard-prescriptions", user?.token],
    queryFn: () => dashboardService.getMyPrescriptions(user?.token),
    enabled: !!user?.token && activeTab === "prescriptions",
    retry: false,
  });

  const summaryStatus = summaryError?.response?.status;
  const isSessionExpired =
    summaryStatus === 401 || error?.response?.status === 401;

  useEffect(() => {
    if (isSessionExpired) {
      localStorage.removeItem("user");
      dispatch(logoutUser());
      navigate("/login");
    }
  }, [isSessionExpired, dispatch, navigate]);

  const badgeCount = (value) => {
    if (isSummaryError) return undefined;
    if (isSummaryLoading) return "…";
    return Number(value ?? 0);
  };

  const TABS = [
    { id: "profile", label: "Profile Info", icon: User },
    {
      id: "orders",
      label: "My Orders",
      icon: Package,
      count: badgeCount(summary?.ordersCount),
    },
    {
      id: "appointments",
      label: "Doctor Appointments",
      icon: Calendar,
      count: badgeCount(summary?.appointmentsCount),
    },
    {
      id: "lab",
      label: "Lab Tests",
      icon: FlaskConical,
      count: badgeCount(summary?.labTestsCount),
    },
    {
      id: "prescriptions",
      label: "Prescriptions",
      icon: FileText,
      count: badgeCount(summary?.prescriptionsCount),
    },
    { id: "settings", label: "Account Settings", icon: Settings },
  ];

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  useEffect(() => {
    if (data && isSuccess) {
      dispatch(getProfile(data));
    }

    if (isError && error && error?.response?.status !== 401) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [data, isSuccess, isError, error, dispatch]);

  useEffect(() => {
    if (!user?.token) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (isLoading) {
    return <LoaderScreen />;
  }

  if (error && !isSessionExpired) {
    return (
      <div className="h-screen">
        <div className="h1 text-center">
          {error.message || "Something Went Wrong..."}
        </div>
      </div>
    );
  }

  const activeOrders = (orders ?? []).filter((o) =>
    ["pending", "confirmed"].includes(String(o?.status ?? "").toLowerCase()),
  );
  const latestOrder = (orders ?? [])[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Patient Profile Header Card */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar with edit badge */}
          <div className="relative group shrink-0">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
              alt={user?.name ?? "User"}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
            />
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-teal-500 hover:bg-teal-400 p-1.5 rounded-xl text-white shadow-md transition-colors"
              title="Change Photo">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">
                {user?.name ?? "—"}
              </h1>
              <Badge variant="success" size="sm" dot>
                {user?.userType ?? "USER"}
              </Badge>
              <span className="text-xs text-teal-200/80 font-mono bg-teal-950/60 px-2 py-0.5 rounded border border-teal-700/50">
                {user?._id ?? ""}
              </span>
            </div>

            <p className="text-xs text-teal-100/90 flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1">
              <span>{user?.email ?? ""}</span>
              <span>•</span>
              <span>{user?.phone ?? ""}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
        className="w-full justify-start overflow-x-auto"
      />

      {isSummaryError && !isSessionExpired && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>
            Could not load your dashboard counts:{" "}
            {summaryError?.response?.data?.message ||
              summaryError?.message ||
              "request failed"}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchSummary()}
            disabled={isSummaryRefetching}>
            {isSummaryRefetching ? "Retrying…" : "Retry"}
          </Button>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Profile information successfully updated in clinical vault (UI
              Simulation).
            </span>
          </div>
          <span className="font-semibold text-emerald-600">Saved</span>
        </div>
      )}

      {/* Tab 1: Profile Info Form */}
      {activeTab === "profile" && user && <ProfileFrom user={user} />}

      {/* Tab 2: Orders */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <Card className="p-8 text-center space-y-4">
            <Package className="w-12 h-12 text-teal-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">
              Medicine Order Management
            </h3>
            {isOrdersLoading ? (
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Loading your orders…
              </p>
            ) : isOrdersError ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Could not load your orders:{" "}
                  {ordersError?.response?.data?.message ||
                    ordersError?.message ||
                    "request failed"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchOrders()}>
                  Retry
                </Button>
              </div>
            ) : (orders ?? []).length === 0 ? (
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You have not placed any medicine orders yet. Find authentic
                medicines with doorstep express dispatch.
              </p>
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You have {activeOrders.length} active order
                  {activeOrders.length === 1 ? "" : "s"} in transit out of{" "}
                  {(orders ?? []).length} total.
                  {latestOrder
                    ? ` Latest: ORD-${String(latestOrder._id).slice(-6).toUpperCase()} • ${formatDate(latestOrder.createdAt)} • ${formatMoney(latestOrder.product?.price)} • ${orderStatusMeta(latestOrder.status).label}.`
                    : ""}
                </p>
              </div>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={() => go("/auth/orders", "orders")}>
              Open Full Orders View →
            </Button>
          </Card>

          {!isOrdersLoading && !isOrdersError && (orders ?? []).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                Recent Orders ({Math.min((orders ?? []).length, 3)} of{" "}
                {(orders ?? []).length})
              </h3>
              {(orders ?? []).slice(0, 3).map((order) => {
                const meta = orderStatusMeta(order.status);
                return (
                  <Card
                    key={order._id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400 font-bold">
                          ORD-{String(order._id).slice(-6).toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">
                          • {formatDate(order.createdAt)}
                        </span>
                        <Badge variant={meta.variant} size="sm" dot>
                          {meta.label}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">
                        {order.product?.name ?? "Product no longer available"}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Total: {formatMoney(order.product?.price)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => go("/auth/orders", "orders")}>
                      View Order
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Appointments */}
      {activeTab === "appointments" && (
        <div className="space-y-4">
          <Card className="p-8 text-center space-y-4">
            <Calendar className="w-12 h-12 text-teal-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">
              Doctor Telehealth Consultations
            </h3>
            {isAppointmentsLoading ? (
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Loading your appointments…
              </p>
            ) : isAppointmentsError ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Could not load your appointments:{" "}
                  {appointmentsError?.response?.data?.message ||
                    appointmentsError?.message ||
                    "request failed"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchAppointments()}>
                  Retry
                </Button>
              </div>
            ) : (appointments ?? []).length === 0 ? (
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You have no doctor appointments yet. Book a consultation to get
                started.
              </p>
            ) : (
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You have {(appointments ?? []).length} appointment
                {(appointments ?? []).length === 1 ? "" : "s"}. Launch video
                rooms or reschedule visits from the full view.
              </p>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={() => go("/auth/my-appointments", "my-appointments")}>
              Open Doctor Appointments View →
            </Button>
          </Card>

          {!isAppointmentsLoading &&
            !isAppointmentsError &&
            (appointments ?? []).length > 0 && (
              <div className="space-y-3">
                {(appointments ?? []).slice(0, 3).map((apt) => {
                  const meta = appointmentStatusMeta(apt.status);
                  const specs = Array.isArray(apt.doctor?.specialization)
                    ? apt.doctor.specialization.join(", ")
                    : (apt.doctor?.specialization ?? "");
                  return (
                    <Card key={apt._id} className="p-5 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400 font-bold">
                          APT-{String(apt._id).slice(-6).toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">
                          • {formatDate(apt.createdAt)}
                        </span>
                        <Badge variant={meta.variant} size="sm" dot>
                          {meta.label}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {apt.doctor?.clinicName ?? "—"}
                        {specs ? ` • ${specs}` : ""}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {apt.doctor?.address ?? ""}
                      </p>
                    </Card>
                  );
                })}
              </div>
            )}
        </div>
      )}

      {/* Tab 4: Lab Tests */}
      {activeTab === "lab" && (
        <div className="space-y-4">
          <Card className="p-8 text-center space-y-4">
            <FlaskConical className="w-12 h-12 text-teal-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">
              Diagnostic Laboratory Bookings
            </h3>
            {isLabLoading ? (
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Loading your lab bookings…
              </p>
            ) : isLabError ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Could not load your lab bookings:{" "}
                  {labError?.response?.data?.message ||
                    labError?.message ||
                    "request failed"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchLab()}>
                  Retry
                </Button>
              </div>
            ) : (labBookings ?? []).length === 0 ? (
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You have no lab test bookings yet. Book a test to get started.
              </p>
            ) : (
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You have {(labBookings ?? []).length} lab booking
                {(labBookings ?? []).length === 1 ? "" : "s"}. Track sample
                collection status and download verified PDF reports.
              </p>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={() =>
                go("/auth/my-lab-appointments", "my-lab-appointments")
              }>
              Open Lab Appointments View →
            </Button>
          </Card>

          {!isLabLoading && !isLabError && (labBookings ?? []).length > 0 && (
            <div className="space-y-3">
              {(labBookings ?? []).slice(0, 3).map((booking) => {
                const meta = labStatusMeta(booking.status);
                return (
                  <Card key={booking._id} className="p-5 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 font-bold">
                        LAB-{String(booking._id).slice(-6).toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400">
                        • {formatDate(booking.createdAt)}
                      </span>
                      <Badge variant={meta.variant} size="sm" dot>
                        {meta.label}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {booking.pathologyTest?.title ??
                        booking.pathologist?.laboratoryName ??
                        "Lab Test"}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {booking.pathologist?.laboratoryAddress ?? ""}
                    </p>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Prescriptions */}
      {activeTab === "prescriptions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Verified Digital Prescriptions (
              {isPrescriptionsLoading ? "…" : (prescriptions ?? []).length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => go("/auth/ai-hub/prescription", "ai-prescription")}
              icon={FileText}>
              Scan New Prescription with AI
            </Button>
          </div>

          {isPrescriptionsLoading ? (
            <Card className="p-8 text-center">
              <p className="text-xs text-slate-500">
                Loading your prescriptions…
              </p>
            </Card>
          ) : isPrescriptionsError ? (
            <Card className="p-8 text-center space-y-3">
              <p className="text-xs text-slate-500">
                Could not load your prescriptions:{" "}
                {prescriptionsError?.response?.data?.message ||
                  prescriptionsError?.message ||
                  "request failed"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchPrescriptions()}>
                Retry
              </Button>
            </Card>
          ) : (prescriptions ?? []).length === 0 ? (
            <Card className="p-8 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">
                No prescriptions yet
              </h4>
              <p className="text-xs text-slate-500">
                Scan a prescription with AI to see it listed here.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {(prescriptions ?? []).map((rx) => {
                const meds = (rx.medicines ?? [])
                  .map((m) => m.name)
                  .filter(Boolean)
                  .join(", ");
                return (
                  <Card
                    key={rx._id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400 font-bold">
                            RX-{String(rx._id).slice(-6).toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-400">
                            • {rx.date ?? formatDate(rx.createdAt)}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                          {rx.doctor_name ?? "—"}
                        </h4>
                        {rx.diagnosis_notes ? (
                          <p className="text-xs text-teal-700 font-medium">
                            {rx.diagnosis_notes}
                          </p>
                        ) : null}
                        {meds ? (
                          <p className="text-[11px] text-slate-500 mt-1">
                            Medications: {meds}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" icon={Download}>
                        Download PDF
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => go("/pharmacy", "pharmacy")}>
                        Order Meds
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Settings */}
      {activeTab === "settings" && (
        <Card className="p-8 space-y-6">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Account Preferences & HIPAA Security
          </h3>
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Email & SMS Health Notifications
                </p>
                <p className="text-xs text-slate-400">
                  Receive order dispatch updates and appointment links
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="rounded text-teal-600 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Export Medical History (HIPAA)
                </p>
                <p className="text-xs text-slate-400">
                  Download complete diagnostic and prescription records archive
                </p>
              </div>
              <Button variant="outline" size="sm">
                Export Data
              </Button>
            </div>

            <div className="pt-2">
              <Button variant="outline" size="sm" icon={KeyRound}>
                Change Account Password
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
