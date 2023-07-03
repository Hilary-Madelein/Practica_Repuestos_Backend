'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const detalleFactura = sequelize.define('detalleFactura', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4}
    }, {
        freezeTableName: true
    });

    detalleFactura.associate = function (models){
        detalleFactura.belongsTo(models.auto, {foreignKey: 'id_auto'});   
        detalleFactura.belongsTo(models.factura, {foreignKey: 'id_factura'}); 
    }
    return detalleFactura;
};