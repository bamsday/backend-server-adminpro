var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');


var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED;

var app = express();

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {


        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            res.status(400).json({
                ok: false,
                mensaje: `Credenciales incorrectas - email`,
                errors: { message: 'Credenciales incorrectas - email' }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            res.status(400).json({
                ok: false,
                mensaje: `Credenciales incorrectas - password`,
                errors: { message: 'Credenciales incorrectas - password' }
            });
        }

        // Crear un token!

        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    })


});





module.exports = app;