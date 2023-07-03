'use strict';

module.exports = (sequelize, DataTypes) => {
    const rol = sequelize.define('rol', {
        nombre: DataTypes.STRING(20),
        estado: {type: DataTypes.BOOLEAN, defaultValue: true},
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    }, {freezeTableName: true});

    rol.associate = function (models) {
        rol.hasMany(models.persona, {foreignKey: 'id_rol', as: 'persona'});
    }

    return rol;    
};