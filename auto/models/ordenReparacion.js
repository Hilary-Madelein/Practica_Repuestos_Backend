'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const ordenReparacion = sequelize.define('ordenReparacion', {
        numeroReparacion: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '000-000-000000001',
            get() {
                const rawValue = this.getDataValue('numeroReparacion');
                const prefix = rawValue.slice(0, 4);
                const middle = rawValue.slice(4, 7);
                const lastNumber = Number(rawValue.slice(8));
                const incrementedNumber = lastNumber + 1;
                const separatedValue = `${prefix}-${middle}-${incrementedNumber.toString().padStart(9, '0')}`;
                return separatedValue;
            },
        },

        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        fechaEmision: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, },
        lugarEmision: { type: DataTypes.STRING(50), defaultValue: "NO_DATA", allowNull: false },
        subTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.0, },
        valorIVA: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.0, },
        total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.0, }
    },
        {
            freezeTableName: true
        });

    ordenReparacion.associate = function (models) {
        ordenReparacion.belongsTo(models.ordenIngreso, { foreignKey: 'id_ordenIngreso' });
        ordenReparacion.hasMany(models.detalleOrden, { foreignKey: 'id_ordenReparacion', as: 'detalleOrden' });
    }

    return ordenReparacion;
};