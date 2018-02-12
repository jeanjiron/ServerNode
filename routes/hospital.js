var express = require('express')
var app = express();

var mdAutenticacion = require('../middlewares/autenticacion')

var Usuario = require('../models/usuario')
var Hospital = require('../models/hospital')

// ======================================================
// get de hospital
// ======================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde)

    Hospital.find({})
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(5)
        .exec(
            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, count) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: count
                    });
                })


            })

})


// ======================================================
// put de hospital
// ======================================================
app.put('/:id', mdAutenticacion.verificarToken, (req, res, next) => {

    var body = req.body;
    var id = req.params.id;

    Hospital.findById(id, (err, hospitalDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospitalDB) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        hospitalDB.nombre = body.nombre;
        hospitalDB.img = body.img
        hospitalDB.usuario = req.usuario._id

        hospitalDB.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al crear hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado,
                usuariotoken: req.usuario
            });
        })
    })
})

// ======================================================
// post de hospital
// ======================================================
app.post('/', mdAutenticacion.verificarToken, (req, res, next) => {

    var body = req.body;


    Usuario.findById(req.usuario._id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        var hospital = new Hospital({
            nombre: body.nombre,
            img: body.img,
            usuario: usuario
        });

        hospital.save((er, hospitalGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al crear hospital',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                hospital: hospitalGuardado,
                usuariotoken: req.usuario
            });
        })

    });

});

// ======================================================
// delete de hospital
// ======================================================
app.delete('/:id', mdAutenticacion.verificarToken, (req, res, next) => {

    var body = req.body;
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
            usuariotoken: req.usuario
        });


    })

})

module.exports = app;