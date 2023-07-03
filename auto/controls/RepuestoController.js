'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
var repuesto = models.repuesto;

class RepuestoController {

    async listar(req, res) {
        var listar = await repuesto.findAll({
            attributes: ['nombre', 'categoria', 'external_id', 'precio', 'marca'],
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener(req, res) {
        const external = req.params.external;
        var listar = await repuesto.findOne({
            where: { external_id: external },
            attributes: ['nombre', 'categoria', 'external_id', 'precio', 'marca'],
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
                categoria: req.body.categoria,
                external_id: req.body.external_id,
                precio: req.body.precio,
                marca: req.body.marca,
            }
            let transaction = await models.sequelize.transaction(); 
            try {
                await repuesto.create(data);
                await transaction.commit();
                res.json({
                    msg: "SE HAN REGISTRADO LOS DATOS DEL REPUESTO",
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
        var respu = await repuesto.findOne({ where: { external_id: req.body.external } });
        if (respu === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            var uuid = require('uuid');
            respu.nombre = req.body.nombre;
            respu.categoria = req.body.categoria;
            respu.precio = req.body.precio;
            respu.marca = req.body.marca;
            respu.external_id = uuid.v4();
            var result = await respu.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "NO SE HAN MODIFICADO LOS DATOS DEL REPUESTO",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "SE HAN MODIFICADO LOS DATOS DEL REPUESTO CORRECTAMENTE",
                    code: 200
                });
            }
        }
    }
}
module.exports = RepuestoController;