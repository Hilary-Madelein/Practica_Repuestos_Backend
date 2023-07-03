'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const factura = sequelize.define('factura', {
        numeroFactura: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '000-000-000000001',
            get() {
              const rawValue = this.getDataValue('numeroFactura');
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
        estado: { type: DataTypes.ENUM('PENDIENTE', 'CANCELADA', 'PAGADA'), allowNull: false, defaultValue: 'PENDIENTE' },
        metodoPago: { type: DataTypes.ENUM('EFECTIVO', 'DEPOSITO', 'TRANSFERENCIA', 'FINANCIAMIENTO_INTERNO', 'FINANCIAMIENTO_EXTERNO'), allowNull: false, defaultValue: 'EFECTIVO' },
        subTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.0, },
        valorIVA: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.0, },
        total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.0, }
    },
        {
            freezeTableName: true
        });

    factura.associate = function (models) {
        factura.belongsTo(models.persona, {foreignKey: 'id_persona'});
        factura.hasMany(models.detalleFactura, { foreignKey: 'id_factura', as: 'detalleFactura'});              
    }

    return factura;
};