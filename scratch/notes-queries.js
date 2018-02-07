'use strict';

const knex = require('../knex');

// const searchTerm = null;

if (searchTerm) {
  knex
    .select('title','content','id')
    .from('notes')
    .where(`${searchTerm}`)
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
} else {
  knex
    .select('title','content','id')
    .from('notes')
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
}

const id = '1001';
knex
  .select('title','content','id')
  .from('notes')
  .where('id',`${id}`)
  .then((response) => {
    console.log(response[0].title);
  });


// const noteID = '1004';
// const updateObj = 
// {title:'testing 987'};

knex('notes')
  .where('id',`${noteID}`)
  .update(updateObj)
  .then((response) => {
    console.log(response);
  }); 

// router.post('/notes', (req, res, next) => {
//   const { title, content } = req.body;
  
//   const newItem = { title, content };
//   /***** Never trust users - validate input *****/
//   if (!newItem.title) {
//     const err = new Error('Missing `title` in request body');
//     err.status = 400;
//     return next(err);
//   }
//   router.post('/notes', (req, res, next) => {
//     const { title, content } = req.body;
    
//     const newItem = { title, content };
//     /***** Never trust users - validate input *****/
//     if (!newItem.title) {
//       const err = new Error('Missing `title` in request body');
//       err.status = 400;
//       return next(err);
//     }
  
//     /*
//     notes.create(newItem)
//       .then(item => {
//         if (item) {
//           res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
//         } 
//       })
//       .catch(err => next(err));
//     */
//   });
  

// const newItem = {title:'testing 12353247', content:'I have three jellyfish'};

knex('notes')
  .insert(newItem)
  .then((response) => {
    console.log(response);
  }); 


// router.delete('/notes/:id', (req, res, next) => {
//   const id = req.params.id;
  
//   /*
//   notes.delete(id)
//     .then(count => {
//       if (count) {
//         res.status(204).end();
//       } else {
//         next();
//       }
//     })
//     .catch(err => next(err));
//   */
// });

// const id = 1005;
knex('notes')
  .where('id',`${id}`)
  .del()
  .then((results) => {
    console.log(results);
  });



knex.destroy();

