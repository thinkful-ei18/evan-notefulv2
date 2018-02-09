'use strict';


const express = require('express');
const router = express.Router();
const knex = require('../knex');
const { UNIQUE_VIOLATION } = require('pg-error-constants');



// GET ALL TAGS
router.get('/tags', (req,res) => {
  knex('tags')
    .select('name','id')
    .then((response) => {
      res.json(response);
    })
    .catch(err => {
      console.log(err);
    });
}); 




// GET TAG BY ID
router.get('/tags/:id', (req,res) => {
  const { id } = req.params;

  knex('tags')
    .first('name','id')
    .where('id',id)
    .then((response) => {
      res.json(response);
    });
});



// CREATE NEW TAG

router.post('/tags', (req,res,next) => {
  const { name } = req.body;
  const newTag = {'name':name};
  
  knex('tags')
    .insert(newTag)
    .returning(['id','name'])
    .then(([result]) => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === UNIQUE_VIOLATION && err.constraint === 'tags_name_key') {
        err = new Error('Tags name is already taken');
        err.status = 409;
      }
      next(err);
    });

});


// UPDATE TAG

router.put('/tags/:id', (req,res,next) => {
  const { id } = req.params;
  const { name } = req.body;
  const updatedTag = {'name':name};
  
  knex('tags')
    .insert(updatedTag)
    .where('id',id)
    .returning(['id','name'])
    .then(([result]) => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === UNIQUE_VIOLATION && err.constraint === 'tags_name_key') {
        err = new Error('Tags name is already taken');
        err.status = 409;
      }
      next(err);
    }); 

});



// DELETE TAG

router.delete('/tags/:id' ,(req,res) => {
  const {id} = req.params;
  
  knex('tags')
    .del()
    .where('id', id)
    .then(() => res.status(204).end())
    .catch(err => console.log(err));
});


module.exports = router;