'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
var marca = models.marca;
var rol = models.rol;
var cuenta = models.cuenta;
const bcypt = require('bcrypt');
const salRounds = 8;

class MarcaController {

    async listar(req, res) {
        var listar = await marca.findAll({
            attributes: ['nombre', 'pais', 'external_id']
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener(req, res) {
        const external = req.params.external;
        var listar = await marca.findOne({
            where: { external_id: external },
            attributes: ['nombre', 'pais', 'external_id'],
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
            var data = {
                nombre: req.body.nombre,
                pais: req.body.pais
            }
            let transaction = await models.sequelize.transaction();
            try {
                await marca.create(data);
                await transaction.commit();
                res.json({
                    msg: "SE HAN REGISTRADO LOS DATOS DE LA MARCA",
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
    }

    async modificar(req, res) {
        var marc = await marca.findOne({ where: { external_id: req.body.external } });
        if (marc === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            var uuid = require('uuid');
            marc.nombre = req.body.nombre;
            marc.pais = req.body.pais;
            marc.external_id = uuid.v4();
            var result = await marc.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "NO SE HAN MODIFICADO LOS DATOS DE MARCA",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "SE HAN MODIFICADO LOS DATOS DE MARCA CORRECTAMENTE",
                    code: 200
                });
            }
        }
    }
    async cantidadMarcas(req, res) {
        const contar = await marca.count();
        console.log("----MMMM",contar);
        res.json({ msg: 'OK!', code: 200, info: contar });
    }
}
module.exports = MarcaController;