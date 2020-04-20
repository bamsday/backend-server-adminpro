var express = require('express');

var app = express();


var Medico = require('../models/medico');
var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/autenticacion');




// RUTAS

// ================================================================
// Consultar todos los medicos
// ================================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);


    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {

            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando el medico',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });

            })


        })
});

// ================================================================
// Crear un medico nuevo
// ================================================================


app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    console.log(body.hospital);

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }



        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });

});




// ================================================================
// Actualizar un medico por ID
// ================================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {



        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + 'no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            })

        });

    });

});

// ================================================================
// Borrar un medico por ID
// ================================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            res.status(400).json({
                ok: false,
                mensaje: `No existe un medico con el ID ${id}`,
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        })

    });

});


module.exports = app;