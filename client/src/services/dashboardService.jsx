import axios from "axios";
import orderService from "./orderService";

const authHeaders = (token) => ({
  headers: { authorization: `Bearer ${token}` },
});

const requireToken = (token) => {
  if (!token) {
    throw new Error("No auth token found. Please login again.");
  }
};

const getSummary = async (token) => {
  requireToken(token);

  const response = await axios.get("/api/dashboard/summary", authHeaders(token));

  const data = response.data?.data ?? response.data ?? {};

  return {
    ordersCount: Number(data.ordersCount ?? 0),
    appointmentsCount: Number(data.appointmentsCount ?? 0),
    labTestsCount: Number(data.labTestsCount ?? 0),
    prescriptionsCount: Number(data.prescriptionsCount ?? 0),
  };
};

const getMyDoctorAppointments = async (token) => {
  requireToken(token);

  const response = await axios.get(
    "/api/doctor/my-appointments",
    authHeaders(token),
  );

  return response.data ?? [];
};

const getMyLabAppointments = async (token) => {
  requireToken(token);

  const response = await axios.get(
    "/api/pathologist/my-appointments",
    authHeaders(token),
  );

  return response.data ?? [];
};

const getMyPrescriptions = async (token) => {
  requireToken(token);

  const response = await axios.get(
    "/api/ai/prescriptions/my",
    authHeaders(token),
  );

  return response.data ?? [];
};

const dashboardService = {
  getSummary,
  getMyOrders: orderService.getMyOrders,
  getMyDoctorAppointments,
  getMyLabAppointments,
  getMyPrescriptions,
};

export default dashboardService;
