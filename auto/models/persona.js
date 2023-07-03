'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const persona = sequelize.define('persona', {
        nombres: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        apellidos: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        identificacion: {type: DataTypes.STRING(15),unique: true},
        tipo_identificacion: {type: DataTypes.ENUM("CEDULA", "PASAPORTE", "RUC"), defaultValue: "CEDULA"},
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        direccion: {type: DataTypes.STRING(255), defaultValue: "NO_DATA"},
        estado:{type: DataTypes.BOOLEAN, defaultValue: true}
    }, {
        freezeTableName: true
    });

    persona.associate = function (models){
        persona.belongsTo(models.rol, {foreignKey: 'id_rol'});
        persona.hasMany(models.factura, { foreignKey: 'id_persona', as: 'factura'});
        persona.hasMany(models.ordenIngreso, { foreignKey: 'id_persona', as: 'ordenIngreso'});
        persona.hasOne(models.cuenta, { foreignKey: 'id_persona', as: 'cuenta'});
    }

    return persona;
};