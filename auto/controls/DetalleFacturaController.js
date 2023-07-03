'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
var factura = models.factura;
var persona = models.persona;
var auto = models.auto;
var detalleFactura = models.detalleFactura;

class DetalleFacturaController {

    async listar(req, res) {
        var listar = await detalleFactura.findAll({
            attributes: ['external_id'],
            include: {
                model: auto,
                as: 'auto',
                attributes: ['modelo', 'anioFabricacion', 'kilometraje', 'placa', 'estado', 'precio', 'color', 'external_id']
            }
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener(req, res) {
        const external = req.params.external;
        var listar = await detalleFactura.findOne({
            where: { external_id: external },
            attributes: ['external_id'],
            include: {
                model: auto,
                as: 'auto',
                attributes: ['modelo', 'anioFabricacion', 'kilometraje', 'placa', 'estado', 'precio', 'color', 'external_id']
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
            var auto_id = req.body.external_auto;
            var persona_id = req.body.external_persona;
            var factura_id = req.body.external_factura;
            if (auto_id != undefined && factura_id != undefined && persona_id != undefined) {

                let autoAux = await auto.findOne({ where: { external_id: auto_id } });
                let facturaAux = await factura.findOne({ where: { external_id: factura_id } });
                let personaAux = await persona.findOne({ where: { external_id: persona_id } });
                if (autoAux && facturaAux && personaAux) {
                    if (autoAux.estado === 'DISPONIBLE') {
                        var data = {
                            id_auto: autoAux.id,
                            id_factura: facturaAux.id
                        }
                        let transaction = await models.sequelize.transaction();
                        try {
                            await detalleFactura.create(data);
                            await transaction.commit();
                            autoAux.estado = 'VENDIDO';
                            autoAux.duenio = personaAux.identificacion;
                            var resulto = await autoAux.save();
                            if (resulto === null) { 
                                res.status(400);
                                res.json({
                                    msg: "ERROR EN CAMBIO DE ESTADO",
                                    code: 400
                                });
                            } else {
                                res.status(200);
                                res.json({
                                    msg: "AUTO VENDIDO",
                                    code: 200
                                });
                            }
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
                        res.json({ msg: "Auto no disponible", code: 200 });
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
        var detalle = await detalleFactura.findOne({ where: { external_id: req.body.external } });
        if (detalle === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            var uuid = require('uuid');
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
module.exports = DetalleFacturaController;