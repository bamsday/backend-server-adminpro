var express = require('express');

var app = express();


var Hospital = require('../models/hospital');
var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/autenticacion');




// RUTAS

// ================================================================
// Consultar todos los hospitales
// ================================================================

app.get('/', (req, res, next) => {


    var desde = req.query.desde || 0;
    desde = Number(desde);


    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {

            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospital',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });

            })


        })
});

// ================================================================
// Crear un hospital nuevo
// ================================================================


app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }



        res.status(201).json({
            ok: true,
            usuario: hospitalGuardado
        });
    });

});




// ================================================================
// Actualizar un hospital por ID
// ================================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {



        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            })

        });

    });

});

// ================================================================
// Borrar un hospital por ID
// ================================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            res.status(400).json({
                ok: false,
                mensaje: `No existe un hospital con el ID ${id}`,
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        })

    });

});


module.exports = app;