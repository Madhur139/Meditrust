import axios from "axios";

const fetchAdminData = async (payload) => {
  if (!payload) {
    throw new Error("No auth token found. Please login as Admin.");
  }

  const options = {
    headers: {
      authorization: `Bearer ${payload}`,
    },
  };

  const [
    responseForUsers,
    responseForProducts,
    responseForOrders,
    responseForDoctors,
    responseForPathologists,
  ] = await Promise.all([
    axios.get("/api/admin/users", options),
    axios.get("/api/admin/products", options),
    axios.get("/api/admin/orders", options),
    axios.get("/api/admin/doctors", options),
    axios.get("/api/admin/pathologists", options),
  ]);

  const data = {
    users: responseForUsers.data ?? [],
    products: responseForProducts.data ?? [],
    orders: responseForOrders.data ?? [],
    doctors: responseForDoctors.data ?? [],
    pathologists: responseForPathologists.data ?? [],
  };

  return data;
};

const authHeaders = (token) => {
  if (!token) {
    throw new Error("No auth token found. Please login as Admin.");
  }
  return { headers: { authorization: `Bearer ${token}` } };
};

const addProduct = async ({ token, formData }) => {
  const response = await axios.post(
    "/api/admin/product",
    formData,
    authHeaders(token),
  );
  return response.data;
};

const updateProduct = async ({ token, productId, formData }) => {
  const response = await axios.put(
    `/api/admin/product/${productId}`,
    formData,
    authHeaders(token),
  );
  return response.data;
};

const deleteProduct = async ({ token, productId }) => {
  const response = await axios.delete(
    `/api/admin/product/${productId}`,
    authHeaders(token),
  );
  return response.data;
};

const adminService = { fetchAdminData, addProduct, updateProduct, deleteProduct };

export default adminService;
