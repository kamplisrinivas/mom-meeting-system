const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.password, u.department_id,
              r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = ? AND u.is_active = 1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        department_id: user.department_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        department_id: user.department_id,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};