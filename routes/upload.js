var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();


var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

// default options
app.use(fileUpload());


// Rutas

app.put('/:tipo/:id', (req, res, next) => {


    var tipo = req.params.tipo;
    var id = req.params.id;


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { messagE: 'Debe de seleccionar una imagen' }
        });
    }


    // Obtener el nombre del archivo

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1]


    // Sólo se aceptan las siguientes extensiones y tipos

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no valida',
            errors: { messagE: 'Las extensiones validas son las siguientes: ' + extensionesValidas.join(', ') }
        });
    }

    var tiposValidos = ['hospitales', 'usuarios', 'medicos'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo no valido',
            errors: { messagE: 'Los tipos validos son los siguientes: ' + tiposValidos.join(', ') }
        });
    }


    // Nombrar archivo 
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    })


});


function subirPorTipo(tipo, id, nombreImagen, res) {

    if (tipo === 'usuarios') {


        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'El usuario no existe' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreImagen;

            usuario.save((err, usuarioActualizado) => {


                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });


            })

        })

    }

    if (tipo === 'hospitales') {


        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'El hospital no existe' }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreImagen;

            hospital.save((err, hospitalActualizado) => {


                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });


            })

        })

    }


    if (tipo === 'medicos') {


        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    errors: { message: 'El medico no existe' }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreImagen;

            medico.save((err, medicoActualizado) => {


                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });


            })

        })

    }


}

module.exports = app;