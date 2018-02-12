var express = require('express')
var app = express();

var mdAutenticacion = require('../middlewares/autenticacion')

var Usuario = require('../models/usuario')
var Hospital = require('../models/hospital')
var Medico = require('../models/medico')


// ======================================================
// get de medico
// ======================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde)

    Medico.find({}, 'nombre usuario img hospital')
        .populate('usuario', 'nombre email')
        .populate('hospital', 'nombre')
        .skip(desde)
        .limit(5)
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar medicos'
                    });
                }

                Medico.count({}, (err, count) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: count
                    });
                })


            });
});

// ======================================================
// post de medico
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

        Hospital.findById(body.hospital, (err, hospitalDB) => {
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

            var medico = new Medico({
                nombre: body.nombre,
                img: body.img,
                usuario: req.usuario._id,
                hospital: body.hospital
            })

            medico.save((err, medicoGuardado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al crear medico',
                        errors: err
                    });
                }

                res.status(201).json({
                    ok: true,
                    hospital: medicoGuardado,
                    usuariotoken: req.usuario
                });
            })


        })



    });

})

// ======================================================
// put de medico
// ======================================================
app.put('/:id', mdAutenticacion.verificarToken, (req, res, next) => {

    var body = req.body;
    var id = req.params.id;

    Medico.findById(id, (err, medicoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medicoDB) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        medicoDB.nombre = body.nombre;
        medicoDB.img = body.img
        medicoDB.usuario = req.usuario._id

        medicoDB.save((err, medicoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al crear medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado,
                usuariotoken: req.usuario
            });
        })
    })

})

// ======================================================
// delete de medico
// ======================================================
app.delete('/:id', (req, res, next) => {
    var body = req.body;
    var id = req.params.id;


    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            usuariotoken: req.usuario
        });


    })

})
module.exports = app;