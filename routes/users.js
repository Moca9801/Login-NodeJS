const express = require('express');
const connection = require('../connection');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
require('dotenv').config();
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole')

router.post('/signup', (req, res) => {
    bcrypt.hash(req.body.password, 10, (err, hash) =>{
        if (err) {
            console.error('Error al hashear la contraseña:', err);
          } else {
            // El 'hash' es el resultado que debes almacenar en tu base de datos
            console.log('Contraseña hasheada:', hash);
            let user = req.body;

            query = "select email, password, role, status from users where email=?";
            connection.query(query, [user.email], (err, results) => {
                if(!err){
                    if(results.length <= 0){
                        query = "insert into users(name, contact, email, password, status, role) value(?,?,?,?, 'false', 'user')";
                        connection.query(query, [user.name, user.contact, user.email, hash], (err, results) => {
                            if(!err){
                                return res.status(200).json({ message: "Succesfully registered."});
                            }else{
                                return res.status(500).json({ message: "Some data entered is incorrect"});
                            }
                        })
                    }else{ return res.status(400).json({ message: "Email already exits."}); }
                }
                else{ return res.status(500).json(err); }
            })
          }
    });
})

router.post('/login', (req, res)=>{
    const user = req.body;
    query = "select email, password, role, status from users where email=?"
    connection.query(query, [user.email], (err, results)=>{
        if(!err){
            bcrypt.compare(user.password, results[0].password, (err, checkpass)=>{
                if(err){
                    console.error('La contraseña es in correcta', err);
                }else{
                    if(results.length <= 0 || !checkpass){
                        return res.status(401).json({message: 'Incorrect username or password'})
                    }else if(results[0].status === "false"){
                        return res.status(401).json({message: 'Wait for admin approval'})
                    }else if(checkpass){
                        const response = {email: results[0].email, role: results[0].role};
                        try{
                            const accesToken = jwt.sign(response, process.env.ACCES_TOKEN, {
                                expiresIn: "8h"
                            });
                            return res.status(200).json({ token: accesToken})
                        }catch(error){
                            console.log(error)
                            return res.status(400).json({message: 'Failed to sign token'})
                        }
                    }else{
                        return res.status(400).json({message: 'Something went wrong. Please try again later'})
                    }
                }
            });
        }else{
            return res.status(500).json(err)
        }
    })
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

function generateRandomPassword() {
    // Genera una cadena de caracteres aleatoria
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let newPassword = '';
    const passwordLength = 12; // Longitud de la contraseña
  
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      newPassword += characters.charAt(randomIndex);
    }
    return newPassword;
}

router.post('/forgotpassword', (req, res)=>{
    const user = req.body;
    const newPassword = generateRandomPassword();
    
    bcrypt.hash(newPassword, 10, (err, hash)=>{
        if(err){
            return res.status(500).json({message: 'Error hashing new password'})
        }else{
            const updateQuery = "UPDATE users SET password=? WHERE email=?";
            connection.query(updateQuery, [hash, user.email], (updateError, results) => {
                if(updateError) {
                    return res.status(500).json({ message: 'Error updating password' });
                }else{
                    var mailOptions = {
                        from: process.env.EMAIL,
                        to: user.email,
                        subject: 'RECUPERACIÓN DE CONTRASEÑA',
                        html: '<p><b>Tus credenciales del sistema son los siguientes: </b><br><b>EMAIL: </b>' + user.email +'<br><b>PASSWORD: </b>'+ newPassword +'<br><a href="http://localhost:4200/">Click aquí para acceder al sistema</a></p>'
                    };

                    transporter.sendMail(mailOptions, function(err, info){
                        if(err){
                            console.log(err);
                        }else{
                            console.log(newPassword);

                            console.log("Email sent succesfully" + info.response);
                        }
                    });
                    return res.status(200).json({message: 'Password sent succesfully to you email.'})
                }
            });
        }
    });
});

router.get('/filter', checkRole.checkRole, auth.authenticateToken, (req, res)=>{
    var query = "SELECT * FROM users where role='user'";
    connection.query(query, (err, results)=>{
        if(!err){
            return res.status(200).json(results)
        }else{
            return res.status(500).json(err)
        }
    })
});

router.patch('/update', auth.authenticateToken, (req, res)=>{
    let user = req.body;
    var query = "update users set status=? where id=?";
    connection.query(query, [user.status, user.id], (err, results)=>{
        if(!err){
            if(results.affectedRows === 0){
                return res.status(404).json({ message: "User id does not exist."})
            }
            return res.status(200).json({ message: "User updated succesfully." })
        }else{
            return res.status(500).json(err)
        }
    });
});

router.get('/checkToken', (req, res) => {
   return res.status(200).json( { message: 'true' })
}); 

router.post('/changePassword', auth.authenticateToken, (req, res)=>{
    let user = req.body;
    var query = "SELECT * FROM users where email=?";

    connection.query(query, [user.email], (err, results)=>{
        if(!err){
            bcrypt.compare(user.password, results[0].password, (err, isCorrectPass) => {
                if(!isCorrectPass){
                    return res.status(200).json({ message: "The password is incorrect." })
                }else{
                    if(user.newPassword === user.renewPassword){
                        bcrypt.hash(user.newPassword, 10, (err, hash)=>{
                            if(!err){
                                var query = "UPDATE users SET password=? WHERE email=?"
                                connection.query(query, [hash, user.email], (err, results)=>{
                                    if(!err){
                                        return res.status(200).json({ message: "Password updated succesfully." })
                                    }else{
                                        return res.status(500).json(err);
                                    }
                                })
                            }else{
                                return res.status(500).json({message: "Can't encrypt password"});
                            }
                        })
                    }else{
                        return res.status(200).json({ message: "Las contraseñas NO coinciden" })
                    }
                }
            })
        }else{
            return res.status(500).json(err);
        }
    })  

    
    //var query = "UPDATE users SET password=? WHERE password=?";
    //connection.query(query, [user.password, user.newPassword], (err, results))
});

module.exports = router;