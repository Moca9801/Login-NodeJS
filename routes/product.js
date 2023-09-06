const express = require('express');
const connection = require('../connection');
const router = express.Router();
require('dotenv').config();
const auth = require('../services/authentication');
const checkRole = require('../services/checkRole');

router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res, next)=>{
    let product = req.body;
    var query = "INSERT INTO product (name, category_id, description, price, status) VALUES (?,?,?,?, 'true')"
    connection.query(query, [product.name, product.category_id, product.description, product.price], (err, results)=>{
        if(!err){
            return res.status(200).json({ message: "Product add succesfully." })
        }else{
            return res.status(500).json(err);
        }
    })

})

router.get('/getAll', auth.authenticateToken, checkRole.checkRole, (req, res, next)=>{
    var query = "SELECT * FROM product";
    connection.query(query, (err, results)=>{
        if(!err){
            return res.status(200).json(results)
        }else{
            return res.status(500).json(err)
        }
    })
})

router.get('/getByCategory', auth.authenticateToken, checkRole.checkRole, (req, res, next)=>{
    let product = req.body;
    var query = "SELECT * FROM product where category_id=?";
    connection.query(query, [product.category_id],(err, results)=>{
        if(!err){
            return res.status(200).json(results)
        }else{
            return res.status(500).json(err)
        }
    })
})

router.get('/getById/:id', auth.authenticateToken, checkRole.checkRole, (req, res, next)=>{
    let product = req.params.id;
    var query = "SELECT * FROM product where id=?";
    connection.query(query, [product],(err, results)=>{
        if(!err){
            return res.status(200).json(results)
        }else{
            return res.status(500).json(err)
        }
    })
})

router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res, next)=>{
    let product = req.body;
    var query = "UPDATE product SET name=?, category_id=?, description=?, price=? WHERE id=?";
    connection.query(query, [product.name, product.category_id, product.description, product.price, product.id], (err, results)=>{
        if(!err){
            if(results.affectedRows === 0){
                return res.status(400).json({ message: "Product not found." })
            }else{
                return res.status(200).json({ message: "Product updated succesfully" })
            }
        }else{
            return res.status(500).json(err)
        }
    })
})

router.delete('/delete/:id', auth.authenticateToken, checkRole.checkRole, (req, res, next)=>{
  let id = req.params.id;
  var query = "DELETE FROM product WHWRE id=?"
  connection.query(query, [id], (err, results)=>{
    if(!err){
        if(results.affectedRows === 0){
            return res.status(400).json({ message: "Product ID not found." })
        }else{
            return res.status(200).json({ message: "Product deleted succesfully." })
        }
    }else{
        return res.status(500).json(err)
    }
  })  
})

router.patch('/updateStatus', auth.authenticateToken, checkRole.checkRole, (req, res, next)=>{
    let product = req.body;
    var query = "UPDATE product SET status=? WHERE id=?";
    connection.query(query, [product.status, product.id], (err, results)=>{
        if(!err){
            if(results.affectedRows === 0){
                return res.status(400).json({ message: "Product ID not found." })
            }else{
                return res.status(200).json({ message: "Product updated succesfully" })
            }
        }else{
            return res.status(500).json(err)
        }
    })
})

module.exports = router;