var express = require('express')
var app = express();
var bcrypt = require('bcrypt');

var mdAutenticacion = require('../middlewares/autenticacion')

var Usuario = require('../models/usuario')

// ======================================================
// get de usuario
// ======================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde)

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar usuarios'
                    });
                }

                Usuario.count({}, (err, count) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: count
                    });
                })
            });
});



// ======================================================
// put de usuario
// ======================================================
app.put('/:id', mdAutenticacion.verificarToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

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

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al crear usuario',
                    errors: err
                });
            }

            usuario.password = ":)"

            res.status(201).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    })


});

// ======================================================
// post de usuario
// ======================================================

app.post('/', mdAutenticacion.verificarToken, (req, res, next) => {

    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });

    });

})

// ======================================================
// delete de usuario
// ======================================================

app.delete('/:id', mdAutenticacion.verificarToken, (req, res, next) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No xiste usuario con ese id',
                errors: err
            });
        }

        usuarioBorrado.password = ":("

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    })
})



module.exports = app