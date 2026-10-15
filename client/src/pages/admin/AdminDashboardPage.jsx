import React, { useEffect, useState } from "react";
import {
  Users,
  Package,
  Stethoscope,
  FlaskConical,
  ShoppingBag,
  Calendar,
  DollarSign,
  TrendingUp,
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Sidebar from "../../components/common/Sidebar";
import AddProductModal from "./AddProductModal";
import VerificationModal from "./VerificationModal";
import { useQuery } from "@tanstack/react-query";
import adminService from "../../services/adminService";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import LoaderScreen from "../../components/common/Loader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useLocation } from "react-router-dom";

export default function AdminDashboardPage({ onNavigate }) {
  const { user } = useSelector((state) => state.auth);

  let { pathname } = useLocation();
  let currentPath = pathname.split("/")[pathname.split("/").length - 1];

  const [activeSection, setActiveSection] = useState("products");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [verificationTarget, setVerificationTarget] = useState(null);

  const { data, isLoading, isSuccess, isError, error } = useQuery({
    queryKey: ["items"],
    queryFn: (payload) => adminService.fetchAdminData(user.token),
  });

  const verifiedDoctors = data?.doctors.filter((doc) => doc.isVerified).length;
  const verifiedPathologists = data?.pathologists.filter(
    (path) => path.isVerified,
  ).length;
  const totalOrders = data?.orders.filter((order) => order.status).length;

  const MOCK_STATS = [
    {
      id: "revenue",
      label: "Total Revenue",
      value: "$184,500",
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
      value: data?.users.length,
      change: "+18.5% year-to-date",
      icon: Users,
      color: "text-sky-600 bg-sky-50",
    },
  ];

  useEffect(() => {
    if (isError && error) {
      toast.error(error.response.data.message);
    }
  }, [isError, error, data, isSuccess]);

  if (isLoading) {
    return <LoaderScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      {/* Main Admin Area */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-x-hidden">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 capitalize">
              {currentPath.toUpperCase()} ADMIN OVERVIEW
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
                onClick={() => setIsAddProductOpen(true)}>
                Add New Product
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("landing")}>
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
                placeholder={`Search ${activeSection}...`}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC DATA TABLE BY SECTION */}
          <div className="overflow-x-auto">
            {/* 1. PRODUCTS TABLE */}
            {activeSection === "products" && (
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
                  {data?.products?.map((row) => (
                    <tr
                      key={row._id}
                      className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {row.name}
                      </td>
                      <td className="py-3 px-4">{row.description}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {row.price}
                      </td>
                      <td className="py-3 px-6">{row.stock} units</td>

                      <td className="py-3 px-4">
                        <Badge variant={row.badgeVariant} size="sm" dot>
                          {row.stock > 0 ? "IN-STOCK" : "OUT-OF-STOCK"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            className="p-1 hover:bg-slate-100 rounded text-slate-600"
                            title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1 hover:bg-rose-50 rounded text-rose-600"
                            title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 2. DOCTORS TABLE */}
            {activeSection === "doctors" && (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Physician Name</th>
                    <th className="py-3 px-4">Specialty</th>
                    <th className="py-3 px-4">Affiliated Hospital</th>
                    <th className="py-3 px-4">State License</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4 text-right">Licensure Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_DOCTORS_DATA.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {row.name}
                      </td>
                      <td className="py-3 px-4 text-teal-700 font-medium">
                        {row.specialty}
                      </td>
                      <td className="py-3 px-4">{row.hospital}</td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {row.license}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={row.badgeVariant} size="sm" dot>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant={
                            row.status === "Verified" ? "outline" : "primary"
                          }
                          size="sm"
                          onClick={() =>
                            setVerificationTarget({ ...row, type: "Doctor" })
                          }>
                          {row.status === "Verified"
                            ? "View Credentials"
                            : "Audit & Approve"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 3. PATHOLOGISTS TABLE */}
            {activeSection === "pathologists" && (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Laboratory Center</th>
                    <th className="py-3 px-4">Medical Director</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Daily Capacity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_PATHOLOGISTS_DATA.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {row.name}
                      </td>
                      <td className="py-3 px-4">{row.director}</td>
                      <td className="py-3 px-4">{row.city}</td>
                      <td className="py-3 px-4">{row.capacity}</td>
                      <td className="py-3 px-4">
                        <Badge variant={row.badgeVariant} size="sm" dot>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setVerificationTarget({
                              ...row,
                              type: "Pathologist",
                            })
                          }>
                          Inspect Audit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 4. ORDERS TABLE */}
            {activeSection === "orders" && (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Fulfillment Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_ORDERS_DATA.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {row.id}
                      </td>
                      <td className="py-3 px-4">{row.user}</td>
                      <td className="py-3 px-4">{row.items}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {row.total}
                      </td>
                      <td className="py-3 px-4">{row.date}</td>
                      <td className="py-3 px-4">
                        <Badge variant={row.badgeVariant} size="sm" dot>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-teal-600 font-semibold hover:underline">
                          Update Tracking
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 5. APPOINTMENTS TABLE */}
            {activeSection === "appointments" && (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Appointment ID</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Scheduled Slot</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_APPOINTMENTS_DATA.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {row.id}
                      </td>
                      <td className="py-3 px-4">{row.patient}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {row.doctor}
                      </td>
                      <td className="py-3 px-4">{row.date}</td>
                      <td className="py-3 px-4">{row.mode}</td>
                      <td className="py-3 px-4">
                        <Badge variant={row.badgeVariant} size="sm" dot>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-teal-600 font-semibold hover:underline">
                          View Logs
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 6. USERS TABLE */}
            {activeSection === "users" && (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Portal Role</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4">Total Orders</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_USERS_DATA.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {row.name}
                      </td>
                      <td className="py-3 px-4">{row.email}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700">
                          {row.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">{row.joined}</td>
                      <td className="py-3 px-4">{row.orders} orders</td>
                      <td className="py-3 px-4">
                        <Badge variant={row.badgeVariant} size="sm" dot>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-slate-400 hover:text-slate-600 p-1">
                          <MoreVertical className="w-4 h-4 ml-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </main>

      {/* MODAL: ADD PRODUCT */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSave={() => setIsAddProductOpen(false)}
      />

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
