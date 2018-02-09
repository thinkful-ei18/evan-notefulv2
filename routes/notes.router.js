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
  const { tagId } = req.query;
  const { folderId } = req.query;
  console.log(req.query);

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
    .where(function () {
      if (tagId) {
        const subQuery = knex.select('notes.id')
          .from('notes')
          .innerJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
          .where('notes_tags.tag_id', tagId);
        this.whereIn('notes.id', subQuery);
      }
    })
    .where(() => {
      if (folderId) { 
        this.where('folders.id', folderId);
      }
    })

    .then(results => {
      const treeize = new Treeize();
      treeize.setOptions({ output: { prune: false}});
      treeize.grow(results);
      const hydrated = treeize.getData();
      res.json(hydrated);
    })
    .catch(err => next(err)); 
});

/* ========== GET/READ SINGLE NOTES ========== */
router.get('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;


  knex
    .select('notes.title','notes.content','notes.id', 'notes.created',
      'folders.name as folderName',
      'folders.id as folderId','tags.name as tags:name','tags.id as tags:id')
    .from('notes')
    .leftJoin('folders','notes.folder_id','folders.id')
    .leftJoin('notes_tags','notes.id','notes_tags.note_id')
    .leftJoin('tags','notes_tags.tag_id','tags.id')
    .where('notes.id',noteId)
    .then(results => {
      const treeize = new Treeize();
      treeize.setOptions({output: { prune:false}});
      treeize.grow(results);
      const hydrated = treeize.getData();
      res.json(hydrated);
    })
    .catch(err => next(err)); 

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;
  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content','folder_id'];
  const {tags} = req.body;

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
    .where('notes.id',noteId)
    .then(() => {
      if (tags) {
        return knex('notes_tags')
          .del()
          .where('notes_tags.note_id',noteId);
      } else {
        return null;
      }
    })
    .then(() => { 
      if (tags) {
        const tagsInsert = tags.map(tagId => ({note_id: noteId, tag_id:tagId}));
        return knex('notes_tags')
          .insert(tagsInsert);
      } else {
        return null;
      }
    })
    .then(() => {
      return knex('notes')
        .select('notes.title','notes.content','notes.id', 'notes.created',
          'folders.name as folderName',
          'folders.id as folderId','tags.name as tags:name','tags.id as tags:id')
        .leftJoin('folders','notes.folder_id','folders.id')
        .leftJoin('notes_tags','notes.id','notes_tags.note_id')
        .leftJoin('tags','notes_tags.tag_id','tags.id')
        .where('notes.id',noteId);
    })
    .then((note) => {
      const treeize = new Treeize();
      treeize.setOptions({output: { prune:false}});
      treeize.grow(note);
      const hydrated = treeize.getData();
      res.json(hydrated);

    })
    .catch(err => console.log(err));
});


/* ========== POST/CREATE ITEM ========== */
router.post('/notes', (req, res, next) => {
  const {title, content, folder_id, tags} = req.body;

  
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

  let noteId;

  knex.insert(newItem)
    .from('notes')
    .returning('id')
    .then(([id]) => { 
      noteId = id;
      if (tags) {
        const tagsInsert = tags.map(tagId => ({note_id: noteId, tag_id:tagId}));
        return knex.insert(tagsInsert)
          .into('notes_tags');
      } else {
        return null;
      }
    })
    .then(() => {
      return knex('notes')
        .select('notes.title','notes.content','notes.id', 'notes.created',
          'folders.name as folderName',
          'folders.id as folderId','tags.name as tags:name','tags.id as tags:id')
        .leftJoin('folders','notes.folder_id','folders.id')
        .leftJoin('notes_tags','notes.id','notes_tags.note_id')
        .leftJoin('tags','notes_tags.tag_id','tags.id')
        .where('notes.id',noteId);
    })
    .then((note) => {
      const treeize = new Treeize();
      treeize.setOptions({output: { prune:false}});
      treeize.grow(note);
      const hydrated = treeize.getData();
      res.json(hydrated);

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


});

module.exports = router;