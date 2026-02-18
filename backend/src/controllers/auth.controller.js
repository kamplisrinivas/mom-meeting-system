const db = require("../config/db");  // 👈 THIS WAS MISSING!
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔍 LOGIN ATTEMPT:', email);
  console.log('🔍 PASSWORD LENGTH:', password ? password.length : 'NO PASSWORD');
  
  if (!email || !password) {
    console.log('🔍 FAIL: Missing email/password');
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const [rows] = await db.query(
      `SELECT 
         u.id, 
         u.name, 
         u.email, 
         u.password,
         r.name AS role
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.email = ? AND u.is_active = 1`,
      [email]
    );
    
    console.log('🔍 DB ROWS FOUND:', rows.length);
    
    if (rows.length === 0) {
      console.log('🔍 FAIL: No user found');
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    console.log('🔍 USER:', user.id, user.name, user.role);
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔍 PASSWORD MATCH:', isMatch);
    
    if (!isMatch) {
      console.log('🔍 FAIL: Password mismatch');
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET || "momsecret";
    const token = jwt.sign(
      { id: user.id, role: user.role },
      secret,
      { expiresIn: "1d" }
    );

    console.log('✅ LOGIN SUCCESS:', user.name);
    
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
