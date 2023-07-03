'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const marca = sequelize.define('marca', {
        nombre: { type: DataTypes.STRING(35), allowNull: false, defaultValue: "NO_DATA" },
        pais: { type: DataTypes.STRING(35), allowNull: false, defaultValue: "NO_DATA" },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 }
    }, {
        freezeTableName: true
    });

    marca.associate = function(models){
        marca.hasMany(models.auto, { foreignKey: 'id_marca', as: 'auto'});
    };

    return marca;
};