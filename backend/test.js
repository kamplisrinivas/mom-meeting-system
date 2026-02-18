const bcrypt = require("bcryptjs");

bcrypt.hash("priya123", 10).then(h => console.log(h));