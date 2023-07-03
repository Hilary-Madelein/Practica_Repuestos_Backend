'use strict';

var models = require('../models/');
var rol = models.rol;

class RolController{
    async listar(req,res){
        var listar= await rol.findAll({
            attributes:['nombre','external_id','estado']
        });
        res.json({msg:'OK!',code:200,info:listar});
    }
}

module.exports = RolController;