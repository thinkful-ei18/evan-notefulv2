'use strict';



const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();
const Treeize = require('treeize');
const knex = require('../knex');

// Get All (and search by query)
/* ========== GET/READ ALL NOTES ========== */
router.get('/notes', (req, res, next) => {
  const { searchTerm } = req.query;
  knex
    .select('notes.title','notes.content','notes.id', 'notes.created',
      'folders.name as folderName',
      'folders.id as folderId','tags.name as tags:name','tags.id as tags:id')
      
    .from('notes')
    .leftJoin('folders','notes.folder_id','folders.id')
    .leftJoin('notes_tags','notes.id','notes_tags.note_id')
    .leftJoin('tags','notes_tags.tag_id','tags.id')
    .where(() => {
      if (searchTerm) { 
        this.where('title','like', `%${searchTerm}%`);
        this.orWhere('content','like', `%${searchTerm}%`);
      }
    })

    .then(results => {
      const treeize = new Treeize();
      treeize.setOptions({ output: { prune: false}});
      treeize.grow(results);
      const hydrated = treeize.getData();
      console.log(hydrated);
      res.json(hydrated);
    })
    .catch(err => next(err)); 
});

/* ========== GET/READ SINGLE NOTES ========== */
router.get('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;


  knex
    .first('notes.title','notes.content','notes.id', 'notes.created', 'folders.name as folderName','folders.id as folderId')
    .from('notes')
    .leftJoin('folders','notes.folder_id','folders.id')
    .where('notes.id',noteId)
    .then(list => {
      res.json(list);
    })
    .catch(err => next(err)); 

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;
  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content','folder_id'];

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
    .update(updateObj)
    .returning('id')
    .where('notes.id',noteId)
    .then(([id]) => { 
      return knex
        .first('notes.title','notes.content','notes.id', 'notes.created', 'folders.name as folderName','folders.id as folderId')
        .from('notes')
        .leftJoin('folders','notes.folder_id','folders.id')
        .where('notes.id',id);
    })
    .then((response) => {
      res.json(response);
    })
    .catch(err => console.log(err));
});


/* ========== POST/CREATE ITEM ========== */
router.post('/notes', (req, res, next) => {
  const {title, content, folder_id} = req.body;
  
  const newItem = { 
    title,
    content,
    folder_id
  };

  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .insert(newItem)
    .returning('id')
    .then(([id]) => { 
      return knex
        .first('notes.title','notes.content','notes.id', 'notes.created', 'folders.name as folderName','folders.id as folderId')
        .from('notes')
        .leftJoin('folders','notes.folder_id','folders.id')
        .where('notes.id',id);
    })
    .then((response) => res.status(201).json(response))
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