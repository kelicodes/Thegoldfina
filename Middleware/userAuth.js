import JWT from "jsonwebtoken";

export const UserAuth = async (req, res, next) => {
  try {
    // Read token from headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Get the token part
    const decoded = JWT.verify(token, process.env.SECRETWORD);

    if (decoded.id) {
      req.user = { _id: decoded.id };
      return next();
    }

    return res.status(401).json({ success: false, message: "Invalid token" });

  } catch (e) {
    console.log(e);
    return res.status(401).json({ success: false, message: "Error in userAuth middleware" });
  }
};

export default UserAuth;
