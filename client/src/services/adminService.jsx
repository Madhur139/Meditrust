import axios from "axios";

const fetchAdminData = async (payload) => {
  const options = {
    headers: {
      authorization: `Bearer ${payload}`,
    },
  };

  const responseForUsers = await axios.get("/api/admin/users", options);
  const responseForProducts = await axios.get("/api/admin/products", options);
  const responseForOrders = await axios.get("/api/admin/orders", options);
  const responseForDoctors = await axios.get("/api/admin/doctors", options);
  const responseForPathologists = await axios.get(
    "/api/admin/pathologists",
    options,
  );

  const data = {
    users: responseForUsers.data,
    products: responseForProducts.data,
    orders: responseForOrders.data,
    doctors: responseForDoctors.data,
    pathologists: responseForPathologists.data,
  };

  return data;
};

const adminService = { fetchAdminData };

export default adminService;
