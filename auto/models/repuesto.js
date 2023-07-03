'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const repuesto = sequelize.define('repuesto', {
        nombre: { type: DataTypes.STRING(30), defaultValue: "NO_DATA", allowNull: false },
        categoria: {type: DataTypes.ENUM('MOTOR', 'ELECTRICO', 'TRANSMISION', 'SUSPENSION', 'FRENOS', 'CARROCERIA', 'DIRECCION', 'EMBRAGUE', 'REFRIGERACION'), allowNull: false, defaultValue: 'MOTOR'},
        estado: {type: DataTypes.BOOLEAN, defaultValue: true },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        precio: {type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0, allowNull: false },
        marca:{type: DataTypes.STRING(15), defaultValue: "NO_DATA", allowNull: false },
    }, {
        freezeTableName: true
    });

    repuesto.associate = function (models){
        repuesto.hasMany(models.detalleOrden, { foreignKey: 'id_repuesto', as: 'detalleOrden'});
    }

    return repuesto;
};