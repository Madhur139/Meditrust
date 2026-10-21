import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/userModel.js";

const userRegister = async (req, res) => {
  // check all field are getting
  const { name, phone, email, password } = req.body;

  if (!name || !phone || !email || !password) {
    res.status(409);
    throw new Error("Please Fill All The Details...");
  }

  // check user exists
  const emailExist = await User.findOne({ email });
  const phoneExist = await User.findOne({ phone });

  if (emailExist || phoneExist) {
    res.status(409);
    throw new Error("User Already Existed...");
  }

  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    email,
    phone,
    name,
    password: hashedPassword,
  });

  res.status(200).json({ message: "Account SuccessFully Has Been Created..." });
};

const userLogin = async (req, res) => {
  // check all field are getting
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(409);
    throw new Error("Please Fill All The Details...");
  }

  // check user exists
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      createdAt: user.createdAt,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Credentials...");
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "10d" });
};

const getMyProfile = async (req, res) => {
  res.status(200).json(req.user);
};

const updateProfile = async (req, res) => {
  const { userType } = req.body;
  if (userType) {
    res.status(401);
    throw new Error("Only Admin Can Change User Type...");
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("No User Found..");
  }

  const updatedProfile = await User.findByIdAndUpdate(user._id, req.body, {
    new: true,
  });

  if (!updatedProfile) {
    res.status(404);
    throw new Error("User Not Updated...");
  }

  res.status(200).json(updatedProfile);
};

const authService = { userRegister, userLogin, getMyProfile, updateProfile };

export default authService;
