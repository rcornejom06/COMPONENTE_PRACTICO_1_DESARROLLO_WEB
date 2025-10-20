const express=require('express');
const mongoose=require('../models/Usuario');

const router=express.Router();

router.get('/usuarios', async(req,res)=>{

    try {
        const usuarios=await Usuario.find();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({error:'Error al obtener usuarios'});
    }
});

router.post('/usuarios', async(req,res)=>{
    try {
        const usuario=new Usuario(req.body);
        await usuario.save();
        res.json(usuario);
    }
    catch (error) {
        res.status(500).json({error:'Error al crear usuario'});
    }
})
module.exports = router;