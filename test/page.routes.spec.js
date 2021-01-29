var supertest = require('supertest');
var app = require('../app');
var agent = supertest.agent(app);
var { Page, User, db } = require('../models');
var expect = require('chai').expect;

describe('Wiki Routes', function() {
  before(function(){
    return db.sync({ force: true })
    //esto borraría todos los registros, para implementar esto un proyecto productivo
    //se hacen los test en un servidor aparte (test ó qa server)
  });

  //done: https://mochajs.org/#working-with-promises
  describe('GET /wiki', function () {
    it('gets 200 on index', function (done) {
      agent
      .get('/wiki')
      .expect(200, done)
    });
  });

  describe('GET /wiki/add', function () {
    it('gets 200 on add page', function (done) {
      agent
      .get('/wiki/add')
      .expect(200, done)
    });
  });

  describe('GET /wiki/:title', function () {
    beforeEach(function(){
      return Page.create({
        title: 'Hello',
        content: 'bye',
      });
    })
    it('gets 200 on title if page exist', function (done) {
      agent
      .get('/wiki/Hello')
      .expect(200, done)
    });
     it('gets 404 on title if page doesnt exist', function (done) {
      agent
      .get('/wiki/Hell')
      .expect(404, done)
    });
  });

  describe('GET /wiki/:title/similar', function () {
    beforeEach(function(){
      return Page.create({
        title: 'Hello',
        content: 'bye'
      });
    })
    it('gets 200 on title if page exist', function (done) {
      agent
      .get('/wiki/Hello/similar')
      .expect(200, done)
    });
     it('gets 404 on title if page doesnt exist', function (done) {
      agent
      .get('/wiki/Hell/similar')
      .expect(404, done)
    });
  });




  

  describe('POST /wiki', function(){
    it('should respond with a 302', function(done) {
      agent
        .post('/wiki/')
        .set('Accept', 'application/x-www-form-urlencoded')
        .send({
          title: 'Hello',
          content: 'bye',
          authorName: 'Guille',
          authorEmail: 'guille@gg.com',
          tags: 'hello, bye',
          status: 'open',
        })
        .expect(302, done)
    });
  })

    describe('Creation of Page and User', function(){
      beforeEach(function(){
        return agent
        .post('/wiki/')
        .send({
          title: 'Hello',
          content: 'bye',
          name: 'Guille',
          email: 'guille@gg.com',
          tags: 'hello, bye',
          status: 'open',
        })
      });
      it('should create a new Page', function (){
        return Page.findOne({
          where: {
            title: 'Hello',
          },
        })
        .then((page) => {
          expect(page).to.exist;
          expect(page.title).to.equal('Hello');
        });
      });
      it('should create a new User', function (){
        return User.findOne({
          where: {
            name: 'Guille',
          },
        })
        .then((user) => {
          expect(user).to.exist;
          expect(user.name).to.equal('Guille');
        });
      });
    });
  });

