var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');
const RolController = require('../controls/RolController');
var rolController = new RolController();
const PersonaController = require('../controls/PersonaController');
var personaController = new PersonaController();
const MarcaController = require('../controls/MarcaController');
var marcaController = new MarcaController();
const AutoController = require('../controls/AutoController');
var autoController = new AutoController();
const DetalleFacturaController = require('../controls/DetalleFacturaController');
var detalleFacturaController = new DetalleFacturaController();
const FacturaController = require('../controls/FacturaController');
var facturaController = new FacturaController();
const CuentaController = require('../controls/CuentaController');
var cuentaController = new CuentaController();
const RepuestoController = require('../controls/RepuestoController');
var repuestoController = new RepuestoController();
const IngresoController = require('../controls/IngresoController');
var ingresoController = new IngresoController();
const ReparacionController = require('../controls/ReparacionController');
var reparacionController = new ReparacionController();
const DetalleOrdenController = require('../controls/DetalleOrdenController');
var detalleOrdenController = new DetalleOrdenController();
const PagoController = require('../controls/PagoController');
var pagoController = new PagoController();
let jwt = require('jsonwebtoken');
const multer = require('multer');

//Middleware



var auth = function middleware(req, res, next) {
  const token = req.headers['x-api-token'];
  if (token) {
    require('dotenv').config();
    const llave = process.env.KEY;
    jwt.verify(token, llave, async (err, decoded) => {
      if (err) {
        res.status(401);
        res.json({
          msg: "TOKEN NO VALIDO",
          code: 401
        });
      } else {
        var models = require('../models');
        var cuenta = models.cuenta;
        req.decoded = decoded;
        let aux = await cuenta.findOne({ where: { external_id: req.decoded.external } })
        if (aux === null) {
          res.status(401);
          res.json({
            msg: "TOKEN NO VALIDO O EXPIRADO",
            code: 401
          });
        } else {
          next();
        }
      }
    });
  } else {
    res.status(401);
    res.json({
      msg: "NO EXISTE TOKEN",
      code: 401
    });
  }

}
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.json({ "version": "1.0", "name": "auto" });
});

//CUENTA
router.post('/sesion', [
  body('usuario', 'Ingrese un usuario').trim().exists().not().isEmpty().isEmail(),
  body('clave', 'Ingrese una clave').trim().exists().not().isEmpty(),
], cuentaController.sesion);

//GET
//------Personas
router.get('/roles', rolController.listar);
router.get('/personas', auth, personaController.listar);
router.get('/personas/obtener/:external', personaController.obtener);

//------Marcas
router.get('/marcas/obtener/:external', marcaController.obtener);
router.get('/marcas/listar', marcaController.listar);

//------Autos
router.get('/autos/obtener', autoController.obtener);
router.get('/autos/obtenervendidos/:external', auth, autoController.obtenerVendidos);
router.get('/autos/listar', auth, autoController.listar);
router.get('/autos/listar/disponibles', autoController.listarAutosDisponibles);
router.get('/autos/listar/vendidos', auth, autoController.listarAutosVendidos);
router.get('/autos/listar/reparacion', auth, autoController.listarAutosReparacion);
//.........Cantidad
router.get('/autos/cantidadautos',auth, autoController.cantAutoVendidos);
router.get('/autos/cantidadautosdisp',auth, autoController.cantAutoDisponibles);
router.get('/marcas/cantidadmarcas',auth, marcaController.cantidadMarcas);

//------Detalle Factura
router.get('/detalle/obtener/:external', auth, detalleFacturaController.obtener);
router.get('/detalle/listar', detalleFacturaController.listar);

//------Factura
router.get('/factura/obtener/:external', facturaController.obtener);
router.get('/factura/listar', facturaController.listar);

//------Repuestos
router.get('/repuestos/obtener/:external', repuestoController.obtener);
router.get('/repuestos/listar', repuestoController.listar);

//------Orden ingreso
router.get('/autos/ingreso/listar', auth,ingresoController.listar);
router.get('/autos/ingreso/obtener/:external',auth, ingresoController.obtener);

//------Orden reparacion
router.get('/autos/orden/listar', auth,reparacionController.listar);
router.get('/autos/orden/obtener/:external',auth, reparacionController.obtener);
router.get('/autos/orden/obtenerExt/:external', auth,reparacionController.obtenerExternal);
router.get('/autos/orden/obtenervalores/:external', auth,reparacionController.obtenerExternalValores);

//------Detalle orden reparacion
router.get('/autos/detalleObterner/:external', auth, detalleOrdenController.obtener);
router.get('/detalle/Obterner/:external', auth, detalleOrdenController.obtenerDatos);
router.get('/autos/detalle/listar', auth, detalleOrdenController.listar);

//-----Imagen
router.get('/imagen/:ruta', autoController.imagenes);

//POST
//------Personas
router.post('/personas/guardar', [
  body('apellidos', 'Ingrese sus apellidos').trim().exists().not().isEmpty().isLength({ min: 3, max: 50 }).withMessage("Ingrese un valor mayor o igual a 3 y menor a 50"),
  body('nombres', 'Ingrese sus nombres').trim().exists().not().isEmpty().isLength({ min: 3, max: 50 }).withMessage("Ingrese un valor mayor o igual a 3 y menor a 50"),
], personaController.guardar);
router.post('/personas/cliente/guardar', [
  body('apellidos', 'Ingrese sus apellidos').trim().exists().not().isEmpty().isLength({ min: 3, max: 50 }).withMessage("Ingrese un valor mayor o igual a 3 y menor a 50"),
  body('nombres', 'Ingrese sus nombres').trim().exists().not().isEmpty().isLength({ min: 3, max: 50 }).withMessage("Ingrese un valor mayor o igual a 3 y menor a 50"),
], personaController.guardarCliente);
router.post('/personas/modificar', personaController.modificar);

//------Marcas
router.post('/marcas/guardar', marcaController.guardar);
router.post('/marcas/modificar', marcaController.modificar);

//------Autos
router.post('/autos/guardar', [
  body('modelo', 'Ingrese un modelo').trim().exists().not().isEmpty(),
  body('color', 'Ingrese un color').trim().exists().not().isEmpty(),
  body('kilometraje', 'Ingrese un kilometraje').trim().exists().not().isEmpty(),
  body('anioFabricacion', 'Ingrese un año').trim().exists().not().isEmpty(),
  body('placa', 'Ingrese una placa').trim().exists().not().isEmpty(),
  body('precio', 'Ingrese un precio').trim().exists().not().isEmpty(),
], autoController.guardar);
router.post('/autos/modificar', autoController.modificar);
router.post('/autos/datos', autoController.guardarDatos);

//------Detalle Factura
router.post('/detalle/guardar',  detalleFacturaController.guardar);
router.post('/detalle/modificar', auth, detalleFacturaController.modificar);

//------Factura
router.post('/factura/generar', auth, facturaController.generar);
router.post('/factura/generar/calcularValores', facturaController.calcularValores);

//------Repuestos
router.post('/repuestos/guardar', repuestoController.guardar);
router.post('/repuestos/modificar', auth, repuestoController.modificar);

//------Orden ingreso
router.post('/autos/ingreso', auth, ingresoController.guardar);

//-----Orden reparacion
router.post('/reparacion/generar', auth, reparacionController.generar); 
router.post('/orden/calcularvalores', auth, reparacionController.calcularValoresOrden);   

//------Detalle Orden reparacion
router.post('/detallereparacion/guardar',auth, detalleOrdenController.guardar);
router.post('/detallereparacion/modificar',auth, detalleOrdenController.modificar);

/*router.get('/sumar/:a/:b', function (req, res, next) { 
  var a = Number(req.params.a);
  var b = Number(req.params.b);
  var c = a + b;
  res.status(200);
  res.json({ "msg": "OK", "resp": c });
});

router.post('/sumar', function (req, res, next) {
  var a = Number(req.body.a);
  var b = Number(req.body.b);
  if (isNaN(a) || isNaN(b)) {
    res.status(400);
    res.json({ "msg": "FALTAN DATOS"});
  }
  var c = a + b;
  res.status(200);
  res.json({ "msg": "OK", "resp": c });

});*/


// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images') // Ruta donde se guardarán las imágenes
  },
  filename: function (req, file, cb) {
    // Generamos un nombre de archivo único utilizando el nombre del campo y la marca de tiempo actual
    cb(null, file.fieldname + '-' + Date.now()+".jpg");
  }
})

// Configuramos el filtro para permitir solo imágenes
function fileFilter(req, file, cb) {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Aceptamos el archivo
  } else {
    cb(new Error('El archivo no es una imagen válido.'), false); // Rechazamos el archivo
  }
}

var upload = multer({ storage: storage, fileFilter: fileFilter});
// Ruta para subir el archivo y los datos del auto juntos
router.post('/auto/guardar/imagen', upload.single('myImage'), autoController.guardar);

//----------PAGO

router.post('/checkout/guardar', pagoController.guardar);
router.get('/checkout/obtener/:checkoutId', pagoController.obtener);


module.exports = router;
