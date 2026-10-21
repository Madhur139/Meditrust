import React, { useState } from "react";
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
import Sidebar from "../common/Sidebar";
import { useLocation } from "react-router-dom";

// Derives every sidebar badge from one admin data payload
// (the same GET /api/admin/* responses each admin page already fetches).
// Returns undefined when data is missing so no fake numbers render
// while loading or after a failed request.
export const buildAdminCounts = (data) => {
  if (!data) return undefined;
  const pendingDoctors = (data.doctors ?? []).filter((d) => !d.isVerified).length;
  const pendingLabs = (data.pathologists ?? []).filter((p) => !p.isVerified).length;
  return {
    // Items awaiting admin review across the verification queues.
    overview: pendingDoctors + pendingLabs,
    products: (data.products ?? []).length,
    doctorsPending: pendingDoctors,
    labsReview: pendingLabs,
    orders: (data.orders ?? []).length,
    users: (data.users ?? []).length,
  };
};

const AdminSidebar = ({ counts }) => {
  let { pathname } = useLocation();
  let currentPath = pathname.split("/")[pathname.split("/").length - 1];

  const SIDEBAR_ITEMS = [
    {
      id: "admin",
      label: "Admin Overview",
      icon: Package,
      badge: counts ? String(counts.overview) : undefined,
      to: "/auth/admin",
    },
    {
      id: "products",
      label: "Products & Inventory",
      icon: Package,
      badge: counts ? String(counts.products) : undefined,
    },
    {
      id: "doctors",
      label: "Doctors & Licensure",
      icon: Stethoscope,
      badge: counts ? `${counts.doctorsPending} Pending` : undefined,
    },
    {
      id: "pathologists",
      label: "Pathology Labs",
      icon: FlaskConical,
      badge: counts ? `${counts.labsReview} Review` : undefined,
    },
    {
      id: "orders",
      label: "Medicine Orders",
      icon: ShoppingBag,
      badge: counts ? String(counts.orders) : undefined,
    },
    {
      id: "users",
      label: "Registered Users",
      icon: Users,
      badge: counts ? String(counts.users) : undefined,
    },
  ];
  return (
    <Sidebar
      items={SIDEBAR_ITEMS}
      activeItem={currentPath === "admin" ? "admin" : currentPath}
      header={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            M
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              Admin Portal
            </h2>
            <p className="text-[10px] text-teal-700 font-semibold uppercase tracking-wider">
              MediTrust Hospital Operations
            </p>
          </div>
        </div>
      }
      footer={
        <div className="text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            Audit Compliance: Active
          </p>
          <p className="text-[11px] text-slate-400">HIPAA Admin Role #9941</p>
        </div>
      }
    />
  );
};

export default AdminSidebar;
