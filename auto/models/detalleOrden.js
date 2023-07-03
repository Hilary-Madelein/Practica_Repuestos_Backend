'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const detalleOrden= sequelize.define('detalleOrden', {
        cantidad: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4}
    }, {
        freezeTableName: true
    });

    detalleOrden.associate = function (models){
        detalleOrden.belongsTo(models.repuesto, {foreignKey: 'id_repuesto'});   
        detalleOrden.belongsTo(models.ordenReparacion, {foreignKey: 'id_ordenReparacion'}); 
    }
    return detalleOrden;
};