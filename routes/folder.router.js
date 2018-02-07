'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');

router.get('/folders', (req,res) => {
  knex
    .select('name','id')
    .from('folders')
    .then((folders) => {
      res.json(folders);
    })
    .catch(err => {
      console.log(err);
    });
});


router.get('/folders/:id', (req,res) => {
  const {id} = req.params;
  knex
    .select('name','id')
    .from('folders')
    .where('id',`${id}`)
    .then((folder) => {
      res.json(folder);
    })
    .catch((err) => {
      console.log(err);
    });
});


router.post('/folders', (req,res) => {
  const {name} = req.body;
  console.log(name);
  if (name) {
    knex('folders')
      .insert({'name': name})
      .then((response) => {
        res.status(201).json(response);
      })
      .catch(err => console.log(err));
  }
});

router.put('/folders/:id', (req,res) => {
  const {id} = req.params;
  const {name} = req.body;
  knex('folders')
    .update({name: name})
    .where('id',id)
    .then((response) => {
      res.status(204).json(response);
    })
    .catch(err => console.log(err));
});

router.delete('/folders/:id', (req,res) => {
  const { id } = req.params;
  
  knex('folders')
    .del()
    .where('id', id)
    .then((response) => {
      res.status(204).json(response);
    })
    .catch(err => console.log(err));
});



module.exports = router;