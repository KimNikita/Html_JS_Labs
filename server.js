const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const connection = require('./db');
const path = require('path');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cookieParser());

// load
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, './public/login.html'));
});

// authorise
app.post('/sign', function (req, res) {
    connection.query('select count(*) exist from users where login=?', [req.body.login], function (err, rows) {
        if (err) {
            console.log(err);
            return;
        }
        if (rows[0].exist == 0) {
            connection.query('insert into users (type, login, password) values (?,?,?)', ['user', req.body.login, req.body.password], function (err, data) {
                if (err) {
                    console.log(err);
                    return;
                }
                connection.query('select id from users where login=?', [req.body.login], function (err, rows) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    res.cookie('id', rows[0].id);
                    res.cookie('type', 'user');
                    res.sendFile(path.join(__dirname, './public/user.html'));
                    console.log('Успешная регистрация');
                });
            });
        }
        else {
            connection.query('select id, type, password from users where login=?', [req.body.login], function (err, rows) {
                if (err) {
                    console.log(err);
                    return;
                }
                if (rows[0].password == req.body.password) {
                    res.cookie('id', rows[0].id);
                    res.cookie('type', rows[0].type);
                    if (rows[0].type == 'admin') {
                        res.sendFile(path.join(__dirname, './public/admin.html'));
                    }
                    else if (rows[0].type == 'worker') {
                        res.sendFile(path.join(__dirname, './public/worker.html'));
                    } else {
                        res.sendFile(path.join(__dirname, './public/user.html'));
                    }
                } else {
                    res.redirect('/login.html');
                }
            });
        }
    });
});

// long pooling
var requests = [];
app.get('/update', function (req, res) {
    requests.push([req, res]);
});

const updater = function () {
    let copy_req = requests;
    requests = [];
    for (let i = 0; i < copy_req.length; i++) {
        if (copy_req[i][0].cookies.type == 'admin') {
            connection.query('select id, text, worker from reports where solved=0', function (err, rows) {
                if (err) {
                    console.log(err);
                    return;
                }
                let part_1 = JSON.stringify(rows);
                connection.query('select login from users where type="worker"', function (err, rows) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    copy_req[i][1].end(JSON.stringify(part_1 + JSON.stringify(rows)));
                });
            });
        }
        else if (copy_req[i][0].cookies.type == 'worker') {
            connection.query('select login from users where id=?', [copy_req[i][0].cookies.id], function (err, rows) {
                if (err) {
                    console.log(err);
                    return;
                }
                connection.query('select id, fio, phone, text from reports where worker=?', [rows[0].login], function (err, rows) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    copy_req[i][1].end(JSON.stringify(rows));
                });
            });
        }
        else {
            connection.query('select id, text, solved, comment from reports where user_id=?', [copy_req[i][0].cookies.id], function (err, rows) {
                if (err) {
                    console.log(err);
                    return;
                }
                copy_req[i][1].end(JSON.stringify(rows));
            });
        }
    }
}

// actions
app.post('/report', function (req, res) {
    /*
    connection.query('insert into reports (user_id, fio, phone, text, solved, comment, worker) values (?,?,?,?,?,?,?)', [req.cookies.id, req.body.fio, req.body.phone, req.body.text, 0, '', 'nobody'], function (err, rows) {
        if (err) {
            console.log(err);
            return;
        }
    });*/
    updater();
    res.end();
});

app.post('/assign', function (req, res) {
    /*
    connection.query('update reports set worker=? where id=?', [req.body.worker_login, req.body.report_id], function (err, rows) {
        if (err) {
            console.log(err);
            return;
        }
    });*/
    updater();
    res.end();
});

app.post('/solve', function (req, res) {
    /*
    connection.query('update reports set solved=?, comment=? where id=?', [1, req.body.comment, req.body.report_id], function (err, rows) {
        if (err) {
            console.log(err);
            return;
        }
    });*/
    updater();
    res.end();
});

app.listen(777);