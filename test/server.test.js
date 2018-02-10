'use strict';

/**
 * DISCLAIMER:
 * The examples shown below are superficial tests which only check the API responses.
 * They do not verify the responses against the data in the database. We will learn
 * how to crosscheck the API responses against the database in a later exercise.
 */
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const expect = chai.expect;
const knex = require('../knex');
const seedData = require('../db/seed/index');



before(function () {
  // noop
});

beforeEach(function () {
  return seedData();
});

afterEach(function () {
  // noop
});

after(function () {
  // destroy the connection
  return knex.destroy();
});


chai.use(chaiHttp);
chai.use(chaiSpies);

describe('Reality check', function () {

  it('true should be true', function () {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });

});


describe('Environment', () => {

  it('NODE_ENV should be "test"', () => {
    expect(process.env.NODE_ENV).to.equal('test');
  });

  it('connection should be test database', () => {
    expect(knex.client.connectionSettings.database).to.equal('notefultest');
  });

});


describe('Express static', function () {

  it('GET request "/" should return the index page', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });

});

describe('404 handler', function () {

  it('should respond with 404 when given a bad path', function () {
    const spy = chai.spy();
    return chai.request(app)
      .get('/bad/path')
      .then(spy)
      .then(() => {
        expect(spy).to.not.have.been.called();
      })
      .catch(err => {
        expect(err.response).to.have.status(404);
      });
  });

});

describe('GET /v2/notes', function () {

  it('should return the default of 10 Notes ', function () {
    return chai.request(app)
      .get('/v2/notes')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
      });
  });

  it('should return a list with the correct right fields', function () {
    return chai.request(app)
      .get('/v2/notes')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        res.body.forEach(function (item) {
          expect(item).to.be.a('object');
          expect(item).to.include.keys('id', 'title', 'content');
        });
      });
  });

  it('should return correct search results for a valid query', function () {
    return chai.request(app)
      .get('/v2/notes?searchTerm=gaga')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(1);
        expect(res.body[0]).to.be.an('object');
        expect(res.body[0].id).to.equal(1003);
      });
  });

  it('should return an empty array for an incorrect query', function () {
    return chai.request(app)
      .get('/v2/notes?searchTerm=Not%20a%20Valid%20Search')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(0);
      });
  });

});

describe('GET /v2/notes/:id', function () {

  it('should return correct notes', function () {
    return chai.request(app)
      .get('/v2/notes/1000')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.include.keys('id', 'title', 'content');
        expect(res.body.id).to.equal(1000);
        expect(res.body.title).to.equal('5 life lessons learned from cats');
      });
  });

  it('should respond with a 404 for an invalid id', function () {
    const spy = chai.spy();
    return chai.request(app)
      .get('/v2/notes/9999')
      .then(spy)
      .then(() => {
        expect(spy).to.not.have.been.called();
      })
      .catch(err => {
        expect(err.response).to.have.status(404);
      });
  });

});

describe('POST /v2/notes', function () {

  it('should create and return a new item when provided valid data', function () {
    const newItem = {
      'title': 'The best article about cats ever!',
      'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
    };
    return chai.request(app)
      .post('/v2/notes')
      .send(newItem)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'title', 'content');

        expect(res.body.title).to.equal(newItem.title);
        expect(res.body.content).to.equal(newItem.content);
        expect(res).to.have.header('location');
      });
  });

  it('should return an error when missing "title" field', function () {
    const newItem = {
      'foo': 'bar'
    };
    const spy = chai.spy();
    return chai.request(app)
      .post('/v2/notes')
      .send(newItem)
      .then(spy)
      .then(() => {
        expect(spy).to.not.have.been.called();
      })
      .catch((err) => {
        const res = err.response;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body.message).to.equal('Missing `title` in request body');
      });
  });

});

describe('PUT /v2/notes/:id', function () {

  it('should update the note', function () {
    const updateItem = {
      'title': 'What about dogs?!',
      'content': 'woof woof',
      'tags': []
    };
    return chai.request(app)
      .put('/v2/notes/1001')
      .send(updateItem)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'title', 'content');

        expect(res.body.id).to.equal(1001);
        expect(res.body.title).to.equal(updateItem.title);
        expect(res.body.content).to.equal(updateItem.content);
      });
  });

  it('should respond with a 404 for an invalid id', function () {
    const updateItem = {
      'title': 'What about dogs?!',
      'content': 'woof woof',
      'tags': []
    };
    const spy = chai.spy();
    return chai.request(app)
      .put('/v2/notes/9999')
      .send(updateItem)
      .then(spy)
      .then(() => {
        expect(spy).to.not.have.been.called();
      })
      .catch(err => {
        expect(err.response).to.have.status(404);
      });
  });

  it('should return an error when missing "title" field', function () {
    const updateItem = {
      'foo': 'bar'
    };
    const spy = chai.spy();
    return chai.request(app)
      .put('/v2/notes/9999')
      .send(updateItem)
      .then(spy)
      .then(() => {
        expect(spy).to.not.have.been.called();
      })
      .catch(err => {
        const res = err.response;
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body.message).to.equal('Missing `title` in request body');
      });
  });

});

describe('DELETE  /v2/notes/:id', function () {

  it('should delete an item by id', function () {
    return chai.request(app)
      .delete('/v2/notes/1005')
      .then(function (res) {
        expect(res).to.have.status(204);
      });
  });

  it('should respond with a 404 for an invalid id', function () {
    const spy = chai.spy();
    return chai.request(app)
      .delete('/v2/notes/9999')
      .then(spy)
      .then(() => {
        expect(spy).to.not.have.been.called();
      })
      .catch(err => {
        expect(err.response).to.have.status(404);
      });
  });

});

// DB TESTS

describe('GET /v2/notes', function () {
  it('Should return 10 notes', function (){
    let count;
    return knex('notes')
      .count()
      .then(([result]) => {
        count = Number(result.count);
        return chai.request(app).get('/v2/notes');
      })

      .then(appres  => {
        expect(count).to.equal(10);
        expect(appres).to.be.json;
        expect(appres.body.length).to.equal(count);
        expect(appres).to.have.status(200);
        expect(appres.body).to.be.a('array');
      });
  });
});

describe('POST /v2/notes',function () {
  it('It should return a proper note when a note is added', function () {
    const newItem = {'title':'Hello There!', 'content':'This is a test note'};
    return chai.request(app)
      .post('/v2/notes')
      .send(newItem)
      .then((response) => {
        expect(response.body.title).to.equal('Hello There!');
        expect(response.body.content).to.equal('This is a test note');
        expect(response).to.have.status(201);
        expect(response.body).to.have.keys('title','created','folderName', 'id','content','tags','folderId');
      });
  });

  it('should return an error when a POST body is missing a required field', function () {
    return chai.request(app)
      .post('/v2/notes')
      .send({})
      .then((response) => {
        console.log(response);
      })
      .catch(err => {
        expect(err).to.have.status(400);
      });
    
  });

  it('Should add one item to the note list when a note is added', function () {
    const newItem = {'title':'Hello There!', 'content':'This is a test note'};
    return chai.request(app)
      .post('/v2/notes')
      .send(newItem)
      .then(() => {
        return chai.request(app).get('/v2/notes');
      })
      .then((response) => {
        expect(response.body.length).to.equal(11);
      });
  });
});

describe('PUT /v2/notes/:id', function () {
  it('Should update a note correctly when making a valid Put request',function() {
    const newItem = {'title':'Hello There!', 'content':'This is a test note'};
    return chai.request(app)
      .put('/v2/notes/1000')
      .send(newItem)
      .then((response) => {
        expect(response.body.title).to.equal('Hello There!');
        expect(response.body.content).to.equal('This is a test note');
        expect(response).to.have.status(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.keys('title','created','folderName', 'id','content','tags','folderId');
      });
  });

  it ('Should return a 404 request when a PUT request is made to a non-existent ID', function () {
    const newItem = {'title':'Hello There!', 'content':'This is a test note'};
    const spy = chai.spy();
    return chai.request(app)
      .put('/v2/notes/9sk490233fcomosellama')
      .send(newItem)
      .then(spy)
      .then((response) => {
        expect(spy).to.not.have.been.called();
      })
      .catch(err => {
        expect(err.response).to.have.status(404);
      });
  });

});

describe('DELETE /v2/notes/:id', function () { 
  it('should remove an item from notes when an item is deleted', function () {
    return chai.request(app)
      .delete('/v2/notes/1000')
      .then(response => {
        expect(response).to.have.status(204);
        return chai.request(app).get('/v2/notes');
      })
      .then((response) => {
        expect(response.body.length).to.equal(9);
        let count;
        return knex('notes')
          .count()
          .then(([response]) => {
            count = Number(response.count);
            expect(count).to.equal(9);
          });
      });
  });

  it('should produce a 404 error when a DELETE request targets a non-existent ID', function () {
    const spy = chai.spy();
    return chai.request(app)
      .delete('/v2/notes/90909')
      .then(spy)
      .then(response => {
        expect(spy).to.not.have.been.called;
      })
      .catch(err => {
        expect(err).to.have.status(404);
      });
  });
});


describe('GET /v2/tags', function () {
  it('should return the entire list of tags', function () {
    return chai.request(app)
      .get('/v2/tags')
      .then((response) => {
        expect(response.body.length).to.equal(4);
        expect(response).to.have.status(200);
        expect(response.body[0]).to.have.keys('name','id');
      });
  });
});