import Order from "../../models/orderModel.js";
import DoctorAppointment from "../../models/doctorAppointmentModel.js";
import PathologyAppointment from "../../models/pathologyAppointmentModel.js";
import Prescription from "../../models/prescriptionModel.js";

const getSummary = async (req, res) => {
  const userId = req.user._id ?? req.user.id;

  const [ordersCount, appointmentsCount, labTestsCount, prescriptionsCount] =
    await Promise.all([
      Order.countDocuments({ user: userId }),
      DoctorAppointment.countDocuments({ user: userId }),
      PathologyAppointment.countDocuments({ user: userId }),
      Prescription.countDocuments({ user: userId }),
    ]);

  return res.status(200).json({
    success: true,
    data: {
      ordersCount: ordersCount ?? 0,
      appointmentsCount: appointmentsCount ?? 0,
      labTestsCount: labTestsCount ?? 0,
      prescriptionsCount: prescriptionsCount ?? 0,
    },
  });
};

const dashboardController = { getSummary };

export default dashboardController;
