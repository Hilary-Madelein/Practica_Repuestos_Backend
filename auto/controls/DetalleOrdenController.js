'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
var ordenReparacion = models.ordenReparacion;
var persona = models.persona;
var repuesto = models.repuesto;
var detalleOrden = models.detalleOrden;

class DetalleOrdenController {

    async listar(req, res) {
        var listar = await detalleOrden.findAll({
            attributes: ['external_id', 'cantidad', 'id_ordenReparacion'],
            include: {
                model: repuesto,
                as: 'repuesto',
                attributes: ['nombre', 'categoria', 'estado', 'external_id', 'precio', 'marca']
            }
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener(req, res) {
        const id = req.params.external;
        console.log("LLLLLLLLLLLLLLLLLLLLLLL",id);
        var listar = await detalleOrden.findAll({
            where: { id_ordenReparacion: id },
            attributes: ['external_id', 'cantidad'],
            include: { 
                model: repuesto,
                as: 'repuesto',
                attributes: ['nombre', 'categoria', 'estado', 'external_id', 'precio', 'marca']
            }
        }); 
        if (listar === null) {
            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtenerDatos(req, res) {
        const external = req.params.external;
        var listar = await detalleOrden.findOne({
            where: { external_id: external },
            attributes: ['external_id', 'cantidad'],
            include: {
                model: repuesto,
                as: 'repuesto',
                attributes: ['nombre', 'categoria', 'estado', 'external_id', 'precio', 'marca']
            }
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
            var ordenReparacion_id = req.body.external_ordenReparacion;
            var repuesto_id = req.body.external_repuesto;
            console.log("ESTO", ordenReparacion_id);
            console.log("ESTO22", ordenReparacion_id);
            if (ordenReparacion_id != undefined && repuesto_id != undefined) {
                let repuestoAux = await repuesto.findOne({ where: { external_id: repuesto_id } });
                let ordenAux = await ordenReparacion.findOne({ where: { external_id: ordenReparacion_id } });
                if (repuestoAux && ordenAux) {
                    if (repuestoAux.estado === true) {
                        var data = {
                            cantidad: req.body.cantidad,
                            id_repuesto: repuestoAux.id,
                            id_ordenReparacion: ordenAux.id
                        }
                        let transaction = await models.sequelize.transaction();
                        try {
                            await detalleOrden.create(data);
                            await transaction.commit();
                            res.json({
                                msg: "SE HAN REGISTRADO LOS DATOS DEL DETALLE",
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
                        res.status(200);
                        res.json({ msg: "Repuesto no disponible", code: 200 });
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
            res.json({ msg: "Datos faltantes", code: 400, errors: errors });
        }

    }

    async modificar(req, res) {
        var detalle = await detalleOrden.findOne({ where: { external_id: req.body.external } });
        if (detalle === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            var uuid = require('uuid');
            detalle.cantidad = req.body.cantidad;
            detalle.external_id = uuid.v4();
            var result = await detalle.save();
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
module.exports = DetalleOrdenController;