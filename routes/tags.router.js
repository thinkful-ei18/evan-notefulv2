'use strict';


const express = require('express');
const router = express.Router();
const knex = require('../knex');



// GET ALL TAGS
router.get('/tags', (req,res) => {
  knex
    .select('name')
    .from('tags')
    .then((response) => {
      res.json(response);
    })
    .catch(err => {
      console.log(err);
    });
}); 






module.exports = router;