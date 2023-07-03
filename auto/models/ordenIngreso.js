'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const ordenIngreso = sequelize.define('ordenIngreso', {
        numeroOrden: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '0001',
            get() {
                const rawValue = this.getDataValue('numeroOrden');
                const incrementedNumber = Number(rawValue) + 1;
                const formattedValue = incrementedNumber.toString().padStart(4, '0');
                return formattedValue;
            },
        },       
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        fechaIngreso: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, },
        fechaEntrega: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, },
        descripcion: { type: DataTypes.STRING(300), defaultValue: "NO_DATA", allowNull: false }
    },
        {
            freezeTableName: true
        });

    ordenIngreso.associate = function (models) {
        ordenIngreso.belongsTo(models.persona, {foreignKey: 'id_persona'});
        ordenIngreso.belongsTo(models.auto, { foreignKey: 'id_auto' });
        ordenIngreso.hasOne(models.ordenReparacion, { foreignKey: 'id_ordenIngreso', as: 'ordenReparacion' });
    }

    return ordenIngreso;
};