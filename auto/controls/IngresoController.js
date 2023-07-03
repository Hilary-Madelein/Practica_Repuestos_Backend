'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
var persona = models.persona;
var auto = models.auto;
var ordenIngreso = models.ordenIngreso;
var marca = models.marca;
const { QueryTypes } = require('sequelize');

class IngresoController {

    async listar(req, res) {
        let listar = await ordenIngreso.findAll({
            attributes: ['id', 'numeroOrden', 'external_id', 'fechaIngreso', 'fechaEntrega', 'descripcion'],
            include: [
                {
                    model: persona,
                    as: 'persona',
                    attributes: ['apellidos', 'nombres', 'direccion', 'identificacion', 'external_id']
                },
                {
                    model: auto,
                    as: 'auto',
                    attributes: ['modelo', 'anioFabricacion', 'kilometraje', 'placa', 'estado', 'precio', 'color', 'external_id', 'duenio'],
                    include: {
                        model: marca,
                        as: 'marca',
                        attributes: ['nombre']
                    }
                }
            ]
        });

        if (listar === null) {
            listar = {};
        }

        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }
      
    async obtener(req, res) {
        const external = req.params.external;
        let listar = await ordenIngreso.findOne({
            where: { external_id: external },
            attributes: ['numeroOrden', 'external_id', 'fechaIngreso', 'fechaEntrega', 'descripcion'],
            include: [
                {
                    model: persona,
                    as: 'persona',
                    attributes: ['direccion', 'apellidos', 'nombres', 'identificacion', 'external_id', 'tipo_identificacion']
                },
                {
                    model: auto,
                    as: 'auto',
                    attributes: ['modelo', 'anioFabricacion', 'kilometraje', 'placa', 'estado', 'precio', 'color', 'external_id', 'duenio'],
                    include: {
                        model: marca,
                        as: 'marca',
                        attributes: ['nombre']
                    }
                }
            ]
        });

        if (listar === null) {
            listar = {};
        }

        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }


    async guardar(req, res) {
        let errors = validationResult(req);
        var listar = await models.sequelize.query(
            'SELECT persona.id FROM auto INNER JOIN persona ON auto.duenio = persona.identificacion',
            {
                type: models.Sequelize.QueryTypes.SELECT
            }
        );

        if (errors.isEmpty()) {
            var auto_id = req.body.external_auto;
            if (auto_id != undefined) {
                let autoAux = await auto.findOne({ where: { external_id: auto_id } });
                if (autoAux) {
                    if (autoAux.estado === 'VENDIDO') {
                        var data = {
                            fechaIngreso: req.body.fechaIngreso,
                            fechaEntrega: req.body.fechaEntrega,
                            descripcion: req.body.descripcion,
                            id_auto: autoAux.id,
                            id_persona: listar[0].id,
                        }
                        let transaction = await models.sequelize.transaction();
                        try {
                            await ordenIngreso.create(data);
                            await transaction.commit();
                            autoAux.estado = 'REPARACION';
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
                                    msg: "AUTO INGRESADO EN REPARACION",
                                    code: 200
                                });
                            }
                            res.json({
                                msg: "SE HAN REGISTRADO LOS DATOS DEL INGRESO",
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
                        res.json({ msg: "Auto que no puede ser reparado", code: 200 });
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

}
module.exports = IngresoController;