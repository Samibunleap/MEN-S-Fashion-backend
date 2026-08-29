const mysql = require("mysql2/promise");
(async () => {
  try {
    const p = await mysql.createPool({host:'localhost',user:'fashion',password:'fashion123'});
    const [r] = await p.query("SELECT user, host, plugin FROM mysql.user WHERE user='root'");
    console.log("User info:", JSON.stringify(r));
    const [r2] = await p.query("SELECT 1+1 as test");
    console.log("Test query:", JSON.stringify(r2));
    await p.end();
    console.log("SUCCESS");
  } catch(e) {
    console.log("Error:", e.code, e.message);
  }
})();
