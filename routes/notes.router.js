'use strict';



const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

const knex = require('../knex');

// Get All (and search by query)
/* ========== GET/READ ALL NOTES ========== */
router.get('/notes', (req, res, next) => {
  const { searchTerm } = req.query;
  
  if (searchTerm) {
    knex
      .select('title','content','id', 'created')
      .from('notes')
      .where('title','like', `%${searchTerm}%`)
      .orWhere('content','like', `%${searchTerm}%`)
      .then(list => {
        res.json(list);
      })
      .catch(err => next(err)); 
  } else {
    knex
      .select('title','content','id','created')
      .from('notes')
      .then(list => {
        res.json(list);
      })
      .catch(err => next(err)); 
  }
});

/* ========== GET/READ SINGLE NOTES ========== */
router.get('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;

  knex
    .first('title','content','id')
    .from('notes')
    .where('id',`${noteId}`)
    .then((item) => {
      if (item) {
        res.json(item);
      }
    });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;
  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .where('id',`${noteId}`)
    .update(updateObj)
    .then((item) => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    });
});

/* ========== POST/CREATE ITEM ========== */
router.post('/notes', (req, res, next) => {
  const { title, content } = req.body;
  
  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .insert(newItem)
    .then(item => {
      if (item) {
        res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
      } 
    })
    .catch(err => console.log(err));

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {
  const id = req.params.id;
  

  knex('notes')
    .where('id',`${id}`)
    .del()
    .then(count => {
      if (count) {
        res.status(204).end();
      } else {
        next();
      }
    });


  /*
  notes.delete(id)
    .then(count => {
      if (count) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(err => next(err));
  */
});

module.exports = router;