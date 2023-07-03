'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
var persona = models.persona;
var auto = models.auto;
var factura = models.factura;
var marca = models.marca;
const detalleFactura = models.detalleFactura;

class FacturaController {

    async listar(req, res) {
        const listar = await factura.findAll({
            attributes: ['numeroFactura', 'external_id', 'fechaEmision', 'lugarEmision', 'estado', 'metodoPago', 'subTotal', 'valorIVA', 'total'],
            include: [
                {
                    model: persona,
                    as: 'persona',
                    attributes: ['apellidos', 'nombres', 'direccion', 'identificacion']
                },
                {
                    model: detalleFactura,
                    as: 'detalleFactura',
                    attributes: ['external_id'],
                    include: {
                        model: auto,
                        as: 'auto',
                        attributes: ['modelo', 'anioFabricacion', 'kilometraje', 'placa', 'estado', 'precio', 'color', 'external_id'],
                        include: {
                            model: marca,
                            as: 'marca',
                            attributes: ['nombre']
                        }
                    }
                }
            ]
        });

        res.json({ msg: 'OK!', code: 200, info: listar });
    }



    async obtener(req, res) {
        const external = req.params.external;
        let listar = await factura.findOne({
            where: { external_id: external },
            attributes: ['numeroFactura', 'external_id', 'fechaEmision', 'lugarEmision', 'estado', 'metodoPago', 'subTotal', 'valorIVA', 'total'],
            include: {
                model: persona,
                as: 'persona',
                attributes: ['apellidos', 'nombres', 'direccion', 'identificacion']
            }
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
            var persona_id = req.body.external_persona;
            if (persona_id != undefined) {
                let personaAux = await persona.findOne({ where: { external_id: persona_id } });
                if (personaAux) {
                    var data = {
                        lugarEmision: req.body.lugarEmision,
                        metodoPago: req.body.metodoPago,
                        id_persona: personaAux.id 
                    }
                    let transaction = await models.sequelize.transaction();
                    try {
                        await factura.create(data)
                        await transaction.commit();
                        res.json({
                            msg: "SE HAN REGISTRADO LOS DATOS DE FACTURA",
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
        var detalle = await detalleFactura.findOne({ where: { external_id: req.body.external } });
        let autoAux = await auto.findOne({ where: { id: detalle.id_auto } });
        var totales = await factura.findOne({ where: { id: detalle.id_factura } });
        if (totales === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            totales.subTotal = Number(autoAux.precio) + Number(totales.subTotal);
            totales.valorIVA = (totales.subTotal * 0.12);
            totales.total = Number(totales.valorIVA) + Number(totales.subTotal);
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
module.exports = FacturaController;