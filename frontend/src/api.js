const API_URL = "http://localhost:5001";

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return res.json();
};

export const fetchMeetings = async (token) => {
  const res = await fetch(`${API_URL}/api/meetings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};