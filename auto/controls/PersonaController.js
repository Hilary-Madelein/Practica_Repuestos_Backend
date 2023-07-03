'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
var persona = models.persona;
var rol = models.rol;
var cuenta = models.cuenta;
const bcypt = require('bcrypt');
const salRounds = 8;

class PersonaController {

    async listar(req, res) {
        var listar = await persona.findAll({
            attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion'],
            include: {
                model: cuenta,
                as: 'cuenta',
                attributes: ['usuario']
            }
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener(req, res) {
        const external = req.params.external;
        var listar = await persona.findOne({
            where: { external_id: external },
            include: {
                model: cuenta,
                as: 'cuenta',
                attributes: ['usuario']
            },
            attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'identificacion', 'tipo_identificacion'],
        });
        if (listar === null) {

            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async guardar(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            var rol_id = req.body.external_rol;
            if (rol_id != undefined) {
                let rolAux = await rol.findOne({ where: { external_id: rol_id } });
                if (rolAux) {
                    var claveHash = function (clave) {
                        return bcypt.hashSync(clave, bcypt.genSaltSync(salRounds), null);
                    };
                    var data = {
                        identificacion: req.body.identificacion,
                        tipo_identificacion: req.body.dni_tipo,
                        nombres: req.body.nombres,
                        apellidos: req.body.apellidos,
                        direccion: req.body.direccion,
                        id_rol: rolAux.id,
                        cuenta: {
                            usuario: req.body.usuario,
                            clave: claveHash(req.body.clave)
                        }
                    }
                    let transaction = await models.sequelize.transaction();
                    try {
                        await persona.create(data, {
                            include: [{
                                model: models.cuenta,
                                as: "cuenta"
                            }]
                            , transaction
                        });
                        await transaction.commit();
                        res.json({
                            msg: "SE HAN REGISTRADO SUS DATOS",
                            code: 200
                        });

                    } catch (error) {
                        if (transaction) await transaction.rollback();
                        if (error.errors && error.errors[0].message) {
                            res.json({ msg: error.errors[0].message, code: 200 });
                        } else {
                            res.json({ msg: error.message, code: 200 });
                        }
                    }
                } else {
                    res.status(400);
                    res.json({ msg: "Datos no encontrados", code: 400 });
                }

            } else {
                res.status(400);
                res.json({ msg: "Faltan datos", code: 400 });
            }
        } else {
            res.status(400);
            res.json({ msg: "Datos faltantes", code: 400, errors: errors});
        }

    }

    async modificar(req, res) {
        var person = await persona.findOne({ where: { external_id: req.body.external } });
        if (person === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            var uuid = require('uuid');
            person.identificacion = req.body.identificacion;
            person.tipo_identificacion = req.body.dni_tipo;
            person.nombres = req.body.nombres;
            person.apellidos = req.body.apellidos;
            person.direccion = req.body.direccion;
            person.external_id = uuid.v4();
            var result = await person.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "NO SE HAN MODIFICADO SUS DATOS",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "SE HAN MODIFICADO SUS DATOS CORRECTAMENTE",
                    code: 200
                });
            }
        }
    }
}
module.exports = PersonaController;