import user from "../Models/Usermodel.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

// ======== USER REGISTRATION ========
export const userRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }

    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User with email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new user({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate token
    const token = JWT.sign({ id: newUser._id }, process.env.SECRETWORD, { expiresIn: "1d" });

    return res.json({ success: true, message: "User registration successful", token });
  } catch (e) {
    console.log(e);
    return res.json({ success: false, message: "User registration failed" });
  }
};

// ======== USER SIGNIN ========
export const userSignin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }

    const theUser = await user.findOne({ email });
    if (!theUser) {
      return res.json({ success: false, message: "User with email does not exist" });
    }

    const passwordCompare = await bcrypt.compare(password, theUser.password);
    if (!passwordCompare) {
      return res.json({ success: false, message: "Invalid password" });
    }

    // Generate token
    const token = JWT.sign({ id: theUser._id }, process.env.SECRETWORD, { expiresIn: "1d" });

    return res.json({ success: true, message: "User signin successful", token });
  } catch (e) {
    console.log(e);
    return res.json({ success: false, message: "User login failed" });
  }
};

// ======== LOGOUT (frontend handles token removal) ========
export const logout = async (req, res) => {
  try {
    // Nothing to clear from backend for token-only auth
    return res.json({ success: true, message: "User logged out. Remove token on client side." });
  } catch (e) {
    return res.json({ success: false, message: e.message });
  }
};


export const fecthme = async (req, res) => {
  try {
    const userId = req.user._id; // middleware attaches _id
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const me = await User.findById(userId).select("-password"); // exclude password
    if (!me) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, me });
  } catch (error) {
    console.error(error, "Error in fetchMe controller");
    return res.status(500).json({ success: false, message: error.message });
  }
};
