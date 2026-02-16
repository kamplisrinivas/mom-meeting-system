require("dotenv").config();
const sendEmail = require("./src/utils/mailer");

(async () => {
  try {
    await sendEmail(
      "nivaskampli@gmail.com",
      "Test Mail",
      "<h3>Email working 🚀</h3>"
    );
    console.log("DONE");
  } catch (err) {
    console.error(err);
  }
})();