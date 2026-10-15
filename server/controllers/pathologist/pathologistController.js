import Pathologist from "../../models/pathologistModel.js";
import PathologyAppointment from "../../models/pathologyAppointmentModel.js";
import PathologyTest from "../../models/pathologyTestModel.js";
import User from "../../models/userModel.js";

const becomePathologist = async (req, res) => {
  let userId = req.user.id;

  const {
    email,
    phone,
    laboratoryName,
    laboratoryAddress,
    experience,
    qualification,
    specialization,
    consultationFee,
    workingHours,
    workingDays,
  } = req.body;

  if (
    !email ||
    !phone ||
    !laboratoryName ||
    !laboratoryAddress ||
    !experience ||
    !qualification ||
    !specialization ||
    !consultationFee ||
    !workingHours ||
    !workingDays
  ) {
    res.status(409);
    throw new Error("Please Fill All The Details...");
  }

  const newPathologist = await Pathologist.create({
    user: userId,
    email,
    phone,
    laboratoryName,
    laboratoryAddress,
    experience,
    qualification,
    specialization,
    consultationFee,
    workingHours,
    workingDays,
  });

  if (!newPathologist) {
    res.status(409);
    throw new Error("Pathologist Not Created...");
  }

  res.status(201).json(newPathologist);
};

const addPathologyTest = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("No User Found..");
  }

  if (user.userType !== "PATHOLOGIST") {
    res.status(401);
    throw new Error("You Are Not Pathologist");
  }

  const pathologist = await Pathologist.findOne({ user: user._id });

  const { title, description, price } = req.body;

  if (!title || !description || !price) {
    res.status(409);
    throw new Error("Please Fill All The Details..");
  }

  const pathologyTest = await PathologyTest.create({
    pathologist: pathologist._id,
    title,
    description,
    price,
  });

  if (!pathologyTest) {
    res.status(409);
    throw new Error("Pathology Test Not Added..");
  }

  res.status(201).json(pathologyTest);
};

const getALlAppointments = async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("No User Found..");
  }

  if (user.userType !== "PATHOLOGIST") {
    res.status(401);
    throw new Error("You Are Not Pathologist");
  }

  const pathologist = await Pathologist.findOne({ user: user._id });

  const appointments = await PathologyAppointment.find({
    pathologist: pathologist._id,
  });

  if (!appointments) {
    res.status(404);
    throw new Error("No Appointments Found...");
  }

  res.status(200).json(appointments);
};

const bookTest = async (req, res) => {
  let userId = req.user.id;
  let pid = req.params.pid;

  const { pathologyTest } = req.body;

  if (!pathologyTest) {
    res.status(409);
    throw new Error("Add Pathology Test..");
  }

  const testBooking = new PathologyAppointment({
    user: userId,
    pathologist: pid,
    pathologyTest: pathologyTest,
  });

  await testBooking.save();
  await testBooking.populate("user");
  await testBooking.populate("pathologist");
  await testBooking.populate("pathologyTest");

  if (!testBooking) {
    res.status(409);
    throw new Error("Pathology Test Is Not Booked...");
  }

  res.status(201).json(testBooking);
};

const updateAppointment = async (req, res) => {
  const appointmentId = req.params.aid;
  const appointment = await PathologyAppointment.findById(appointmentId);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment Does Not Exist...");
  }

  const updatedAppointment = await PathologyAppointment.findByIdAndUpdate(
    appointmentId,
    req.body,
    { new: true },
  );

  if (!updatedAppointment) {
    res.status(409);
    throw new Error("Appointment Is Not Updated...");
  }

  res.status(200).json(updatedAppointment);
};

const getAllPathologists = async (req, res) => {
  const pathologist = await Pathologist.find().populate("user");

  if (!pathologist) {
    res.status(404);
    throw new Error("Pathologist Does Not Exist..");
  }

  res.status(200).json(pathologist);
};

const getAllPathologyTests = async (req, res) => {
  const tests = await PathologyTest.find().populate("pathologist");

  if (!tests) {
    res.status(404);
    throw new Error("Test Does Not Exist...");
  }

  res.status(200).json(tests);
};

const getAppointment = async (req, res) => {
  const appointmentId = req.params.aid;
  const appointment = await PathologyAppointment.findById(appointmentId)
    .populate("user")
    .populate("pathologist")
    .populate("pathologyTest");

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment Does Not Exist...");
  }

  res.status(200).json(appointment);
};

const pathologistController = {
  becomePathologist,
  addPathologyTest,
  bookTest,
  getALlAppointments,
  updateAppointment,
  getAppointment,
  getAllPathologists,
  getAllPathologyTests,
};

export default pathologistController;
