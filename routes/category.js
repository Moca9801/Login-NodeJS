const express = require('express');
const connection = require('../connection');
const router = express.Router();
require('dotenv').config();


const auth = require('../services/authentication');
const checkRole = require('../services/checkRole');

router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res, next)=>{
    let category = req.body;
    query = "INSERT INTO category (name) VALUES (?)"
    connection.query(query, [category.name], (err, results)=>{
        if(!err){
            return res.status(200).json({ message: "Category add succesuflly." })
        }else{
            return res.status(500).json(err);
        }
    })
})

router.get('/getAll', auth.authenticateToken, (req, res, next)=>{
    query = "SELECT * FROM category"
    connection.query(query, (err, results)=>{
        if(!err){
            return res.status(200).json(results)
        }else{
            return res.status(500).json(err)
        }
    })

})

router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res, next)=>{
    let category = req.body;
    var query = "UPDATE category SET name=? WHERE id=?"
    connection.query(query, [category.name, category.id], (err, results)=>{
        if(!err){
            if(results.affectedRows === 0){
                return res.status(400).json({ message: "Category not found." })
            }else{
                return res.status(200).json({ message: "Category updated succesfully" })
            }
        }else{
            return res.status(500).json(err)
        }
    })
});

module.exports = router;