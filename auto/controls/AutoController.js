'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
var auto = models.auto;
var marca = models.marca;
const { Op } = require('sequelize');

class AutoController {

    async listar(req, res) {
        var listar = await auto.findAll({
            attributes: ['modelo', 'anioFabricacion', 'kilometraje', 'placa', 'estado', 'precio', 'color', 'external_id'],
            include: {
                model: marca,
                as: 'marca',
                attributes: ['nombre']
            }
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async listarAutosVendidos(req, res) {
        var lista = await models.sequelize.query(
            'SELECT auto.id, auto.modelo, auto.placa, auto.anioFabricacion, auto.estado, auto.kilometraje, auto.color,  auto.precio, auto.external_id, persona.nombres, persona.apellidos, persona.identificacion FROM auto INNER JOIN persona ON auto.duenio = persona.identificacion',
            { type: models.Sequelize.QueryTypes.SELECT }
        );
        if (lista === null) {
            res.status(200);
            res.json({ msg: "No existen datos registrados", code: 200, info: lista });
        } else {
            res.status(200);
            res.json({ msg: "OK!", code: 200, info: lista });
        }
    }

    async listarAutosDisponibles(req, res) {
        var listar = await auto.findAll({
            where: { estado: 'DISPONIBLE' },
            attributes: ['modelo', 'anioFabricacion', 'kilometraje', 'placa', 'estado', 'precio', 'color', 'external_id'],
            include: {
                model: marca,
                as: 'marca',
                attributes: ['nombre']
            }
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async listarAutosReparacion(req, res) {
        var lista = await models.sequelize.query(
            'SELECT auto.modelo, auto.placa, auto.anioFabricacion, auto.kilometraje, auto.color, auto.precio, persona.nombres, persona.apellidos, persona.identificacion FROM auto INNER JOIN persona ON auto.duenio = persona.identificacion WHERE auto.estado = "REPARACION"',
            { type: models.Sequelize.QueryTypes.SELECT }
        );
        if (lista.length === 0) {
            res.status(200);
            res.json({ msg: "No existen datos registrados", code: 200, info: lista });
        } else {
            res.status(200);
            res.json({ msg: "OK!", code: 200, info: lista });
        }
    }


    /*async listarAutosVendidos(req, res) {
        var listar = await auto.findAll({
            where: {estado: false},
            attributes: ['modelo', 'anioFabricacion', 'kilometraje', 'placa', 'estado', 'precio', 'color', 'external_id'],
            include: {
                model: marca,
                as: 'marca',
                attributes: ['nombre']
            }
        });
        res.json({ msg: 'OK!', code: 200, info: listar });
    }*/

    async obtener(req, res) {
        const external = req.params.external;
        console.log("EJEM", external);
        var listar = await auto.findOne({
            where: { external_id: external },
            include: {
                model: marca,
                as: 'marca',
                attributes: ['nombre']
            },
            attributes: ['modelo', 'anioFabricacion', 'kilometraje', 'placa', 'estado', 'precio', 'color', 'external_id'],
        });
        if (listar === null) {

            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });
    }

    async obtenerVendidos(req, res) {
        var listar = await models.sequelize.query(
            'SELECT auto.modelo, auto.placa, auto.anioFabricacion, auto.kilometraje, auto.color, auto.precio, auto.external_id AS auto_external_id, persona.nombres, persona.apellidos, persona.identificacion, persona.external_id AS persona_external_id FROM auto INNER JOIN persona ON auto.duenio = persona.identificacion WHERE auto.external_id = :external_id',
            {
                replacements: { external_id: req.params.external },
                type: models.Sequelize.QueryTypes.SELECT
            }
        );

        if (listar === null) {

            listar = {};
        }
        res.status(200);
        res.json({ msg: 'OK!', code: 200, info: listar });

    }


    async guardar(req, res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {

            var marca_id = req.body.external_marca;
            if (marca_id != undefined) {
                let marcaAux = await marca.findOne({ where: { external_id: marca_id } });
                if (marcaAux) {
                    var data = {
                        modelo: req.body.modelo,
                        anioFabricacion: req.body.anioFabricacion,
                        kilometraje: req.body.kilometraje,
                        placa: req.body.placa,
                        precio: req.body.precio,
                        color: req.body.color,
                        id_marca: marcaAux.id,
                    }
                    let transaction = await models.sequelize.transaction();
                    try {
                        await auto.create(data);
                        await transaction.commit();
                        res.json({
                            msg: "SE HAN REGISTRADO LOS DATOS DEL AUTO",
                            code: 200
                        });

                    } catch (error) {
                        if (transaction) await transaction.rollback();
                        if (error.errors && error.errors[0].message) {
                            //console.log("AQUI");
                            res.json({ msg: error.errors[0].message, code: 200 });
                        } else {
                            //console.log("AQUI 2");
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

    async modificar(req, res) {
        var car = await auto.findOne({ where: { external_id: req.body.external_id } });
        if (car === null) {
            res.status(400);
            res.json({
                msg: "NO EXISTEN REGISTROS",
                code: 400
            });
        } else {
            var uuid = require('uuid');
            car.modelo = req.body.modelo;
            car.anioFabricacion = req.body.anioFabricacion;
            car.kilometraje = req.body.kilometraje;
            car.placa = req.body.placa;
            car.precio = req.body.precio;
            car.color = req.body.color;
            car.external_id = uuid.v4();
            var result = await car.save();
            if (result === null) {
                res.status(400);
                res.json({
                    msg: "NO SE HAN MODIFICADO LOS DATOS DEL AUTO",
                    code: 400
                });
            } else {
                res.status(200);
                res.json({
                    msg: "SE HAN MODIFICADO LOS DATOS DEL AUTO CORRECTAMENTE",
                    code: 200
                });
            }
        }
    }

    async cantAutoVendidos(req, res) {
        const contar = await auto.count({ where: { duenio: { [Op.not]: 'NO_DATA' } } });
        console.log("----", contar);
        res.json({ msg: 'OK!', code: 200, info: contar });
    }


    async cantAutoDisponibles(req, res) {
        const contar = await auto.count({ where: { duenio: 'NO_DATA' } });
        console.log("Cantidad de autos con duenio 'NO_DATA':", contar);
        res.json({ msg: 'OK!', code: 200, info: contar });
    }



}
module.exports = AutoController;