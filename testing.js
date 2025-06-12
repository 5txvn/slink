const crypto = require("crypto");
console.log(BigInt("0x" + crypto.randomBytes(32).toString("hex"), 16).toString());