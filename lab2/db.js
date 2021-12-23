var db = require("mysql");
var connection = db.createConnection({
    host: "localhost",
    user: "root",
    password: "Qwerty123",
    database: "tehsupport"
});

connection.connect(function (err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log("Подключение установлено");
})

module.exports = connection;
