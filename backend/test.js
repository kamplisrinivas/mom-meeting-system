const bcrypt = require("bcryptjs");

(async () => {
  const hash = await bcrypt.hash("user123", 10);
  console.log(hash);
})();