'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
var auto = models.auto;
var ordenIngreso = models.ordenIngreso;
var repuesto = models.repuesto;
var detalleOrden = models.detalleOrden;
var ordenReparacion = models.ordenReparacion;

class ReparacionController {

    async listar(req, res) {
        const listar = await ordenReparacion.findAll({
            attributes: ['numeroReparacion', 'external_id', 'fechaEmision', 'lugarEmision', 'subTotal', 'valorIVA', 'total'],

        });

        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtener(req, res) {
        const external = req.params.external;
        let listar = await ordenReparacion.findOne({
            where: { external_id: external },
            attributes: ['numeroReparacion', 'external_id', 'fechaEmision', 'lugarEmision', 'subTotal', 'valorIVA', 'total'],
        });   
        if (listar === null) {
            listar = {};
        }
    
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }   

    async obtenerExternal(req, res) {
        const id = req.params.external;
        let listar = await ordenReparacion.findOne({
            where: { id_ordenIngreso: id },
            attributes: ['id','external_id', 'subTotal', 'valorIVA', 'total','id_ordenIngreso'],
        });   
        if (listar === null) {
            listar = {};
        }
    
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    } 

    async obtenerExternalValores(req, res) {
        const id = req.params.external;
        console.log("99999", req.params);
        let listar = await ordenReparacion.findOne({
            where: { id: id },
            attributes: ['subTotal', 'valorIVA', 'total'],
        });   
        if (listar === null) {
            listar = {};
        }
    
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    } 

    async generar(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            var ordenIngreso_id = req.body.external_ordenIngreso;
            if (ordenIngreso_id != undefined) {
                let ingresoAux = await ordenIngreso.findOne({ where: { external_id: ordenIngreso_id } });
                let autoAux = await auto.findOne({ where: { id: ordenIngreso_id } });
                if (ingresoAux) {
                    var data = {
                        lugarEmision: req.body.lugarEmision,
                        id_ordenIngreso: ingresoAux.id
                    }
                    let transaction = await models.sequelize.transaction();
                    try {
                        await ordenReparacion.create(data)
                        await transaction.commit();
                        res.json({
                            msg: "Datos validados",
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
            res.json({ msg: "Datos faltantes", code: 400, errors: errors });
        }
    }

    async calcularValores(req, res) {
        var detalle = await detalleOrden.findOne({ where: { external_id: req.body.external } });
        let repuestoAux = await repuesto.findOne({ where: { id: detalle.id_repuesto } });
        var totales = await ordenReparacion.findOne({ where: { id: detalle.id_ordenReparacion } });
        if (totales === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            var cant = repuestoAux.precio*detalle.cantidad
            totales.subTotal = Number(cant) + Number(totales.subTotal);
            totales.valorIVA = (totales.subTotal * 0.12);
            totales.total = (Number(totales.valorIVA) + Number(totales.subTotal))+Number(totales.total);
            var result = await totales.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "EL CALCULO NO SE HA REALIZADO EXITOSAMENTE",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "EL CALCULO SE HA REALIZADO EXITOSAMENTE",
                    code: 200
                });
            }
        }
    }
 
    async calcularValoresOrden(req, res) { 
        var detalle = await detalleOrden.findOne({ where: { external_id: req.body.external_id } });
        var totales = await ordenReparacion.findOne({ where: { id: detalle.id_ordenReparacion } });
        if (totales === null) { 
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            totales.subTotal = req.body.subTotal;
            totales.valorIVA = req.body.valorIVA;
            totales.total = req.body.total;   
            var result = await totales.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "EL CALCULO NO SE HA REALIZADO EXITOSAMENTE",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "EL CALCULO SE HA REALIZADO EXITOSAMENTE",
                    code: 200
                });
            }
        }
    }

}
module.exports = ReparacionController;