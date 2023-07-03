'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const auto = sequelize.define('auto', {
        modelo: { type: DataTypes.STRING(30), defaultValue: "NO_DATA", allowNull: false },
        anioFabricacion: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
        kilometraje: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
        placa: {type: DataTypes.STRING(10), allowNull: true, defaultValue: "NO_DATA"},
        estado: {type: DataTypes.ENUM('VENDIDO', 'DISPONIBLE', 'REPARACION'), allowNull: false, defaultValue: 'DISPONIBLE' },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        precio: {type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0, allowNull: false },
        color:{type: DataTypes.STRING(15), defaultValue: "NO_DATA", allowNull: false },
        duenio:{type: DataTypes.STRING(15), defaultValue: "NO_DATA"}
    }, {
        freezeTableName: true
    });

    auto.associate = function (models){
        auto.belongsTo(models.marca, {foreignKey: 'id_marca'});
        auto.hasOne(models.detalleFactura, { foreignKey: 'id_auto', as: 'detalleFactura'});
        auto.hasOne(models.ordenIngreso, { foreignKey: 'id_auto', as: 'ordenIngreso'});
    }

    return auto;
};