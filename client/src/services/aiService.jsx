import axios from "axios";

const sendChatMessage = async ({ message, history, token }) => {
  if (!token) {
    throw new Error("No auth token found. Please login again.");
  }

  const response = await axios.post(
    "/api/ai/chat",
    { message, history },
    { headers: { authorization: `Bearer ${token}` } },
  );

  return response.data?.reply ?? "";
};

const scanPrescription = async ({ file, token }) => {
  if (!token) {
    throw new Error("No auth token found. Please login again.");
  }
  if (!file) {
    throw new Error("Please choose a prescription image first.");
  }

  const formData = new FormData();
  formData.append("prescription", file);

  const response = await axios.post("/api/ai/prescription", formData, {
    headers: { authorization: `Bearer ${token}` },
  });

  return response.data;
};

const aiService = { sendChatMessage, scanPrescription };

export default aiService;
