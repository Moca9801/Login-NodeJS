const express = require('express');
const connection = require('../connection');
const router = express.Router();
require('dotenv').config();

let ejs = require('ejs');
let pdf = require('html-pdf');
let path = require('path');
let fs = require('fs');
let uuid = require('uuid');

const auth = require('../services/authentication');

router.post('/generateReport', auth.authenticateToken, (req, res)=>{
    const generateUUID = uuid.v1();
    const orderDetails = req.body;
    var productDetailsReport = JSON.parse(orderDetails.productDetails);

    var query = "INSERT INTO bill (name, uuid, email, contact, paymentMethod, total, productDetails, createBy) VALUES (?,?,?,?,?,?,?,?)";
    connection.query(query, [orderDetails.name, generateUUID, orderDetails.email, orderDetails.contact, orderDetails.paymentMethod, orderDetails.totalAmount, orderDetails.productDetails, res.locals.email], (err, results) => {
        if(!err){
            ejs.renderFile(path.join(__dirname, '', '../report/report.ejs'), { 
                productDetails: productDetailsReport, 
                name: orderDetails.name, 
                email: orderDetails.email,
                contact: orderDetails.contact,
                paymentMethod: orderDetails.paymentMethod,
                totalAmount: orderDetails.totalAmount,
            }, (err, results)=>{
                if(err){
                    console.log("EJS ERROR.")
                    return res.status(500).json({message: "" + err});
                }else{
                    pdf.create(results).toFile('./pdf/' + generateUUID + '.pdf', function(err, data){
                        if(err){
                            console.log("NO SE PUDO CREAR EL PDF DE LA FACTURA")
                            return res.status(500).json({message: "PDF don't created." + err});
                        }else{
                            return res.status(200).json( { uuid: generateUUID });
                        }
                    })
                }
            })
        }else{
            console.log("NO SE PUDO CARGAR LA INFORMACION EN LA BASE DE DATOS.")
            return res.status(500).json({message: "Data not upload" + err})
        }
    })
});

router.get('/getUUID/:uuid', auth.authenticateToken, (req, res)=>{
    const uuid = req.params.uuid;
    const pathUUID = '/pdf/' + uuid +'.pdf';
    var query = "SELECT * FROM bill WHERE uuid=?"
    connection.query(query, [uuid], (err, results)=>{
        if(!err){
            if(fs.existsSync(path.join(process.cwd() + pathUUID))){
                res.contentType("application/pdf");
                console.log(uuid)
                return fs.createReadStream(path.join(process.cwd() + pathUUID)).pipe(res);

            }else{
                return res.status(404).json({ message: "NOT FOUND"})
            }
        }else{
            return res.status(500).json(err)
        }
    })
});

router.get('/getAll', auth.authenticateToken, (req, res)=>{
    var query = "SELECT * FROM bill"
    connection.query(query, (err, results)=>{
        if(!err){
            return res.status(200).json(results)
        }else{
            return res.status(500).json(err)
        }
    })
})

router.delete('/delete/:id', auth.authenticateToken, (req, res)=>{
    const id = req.params.id;
    var query = "DELETE FROM bill WHERE id=?"
    connection.query(query, [id], (err, results)=>{
        if(!err){
            if(results.affectedRows === 0){
                return res.status(404).json({message: "Bill id not found."});

            }else{
                return res.status(200).json({message: "Bill deteled sucessfully."});
            }
        }else{
            return res.status(500).json(err);
        }
    })
})

module.exports = router;