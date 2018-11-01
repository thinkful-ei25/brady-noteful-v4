'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const User = require('../models/user');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Users', function() {
  const username = 'exampleUser';
  const password = 'examplePass';
  const fullname = 'Example User';

  before(function() {
    return mongoose
      .connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return User.createIndexes();
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('/api/users', function() {
    describe('POST', function() {
      it('Should create a new user', function() {
        const testUser = { username, password, fullname };

        let res;
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(_res => {
            res = _res;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'id',
              'username',
              'fullname',
              'createdAt',
              'updatedAt'
            );

            expect(res.body.id).to.exist;
            expect(res.body.username).to.equal(testUser.username);
            expect(res.body.fullname).to.equal(testUser.fullname);

            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.id).to.equal(res.body.id);
            expect(user.fullname).to.equal(testUser.fullname);
            return user.validatePassword(password);
          })
          .then(isValid => {
            expect(isValid).to.be.true;
          });
      });

      it('Should reject users with missing username', function() {
        const testUser = { password, fullname };
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Missing field');
          });
      });

      it('Should reject users with missing password', function() {
        const testUser = { fullname, username };
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Missing field');
          });
      });

      it('Should reject users with non-string username', function() {
        const testUser = { fullname, username: 23748292, password };
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
          });
      });

      it('Should reject users with non-string password', function() {
        const testUser = { fullname, username, password: 1231323 };
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
          });
      });

      it('Should reject users with non-trimmed username', function() {
        const testUser = { fullname, username: ` ${username} `, password };
        chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal(
              'Please remove whitespace at beginning or end of field'
            );
          });
      });

      it('Should reject users with non-trimmed password', function() {
        const testUser = { fullname, username, password: ` ${password} ` };
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal(
              'Please remove whitespace at beginning or end of field'
            );
          });
      });

      it('Should reject users with empty username', function() {
        const testUser = { fullname, password, username: '' };
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal(
              'Must be at least 3 characters long'
            );
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.location).to.equal('username');
          });
      });

      it('Should reject users with 21+ long username', function() {
        const testUser = {
          fullname,
          password,
          username: 'abcdefghijklmnopqrstuvwxyz'
        };
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal(
              'Must be at most 20 characters long'
            );
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.location).to.equal('username');
          });
      });

      it('Should reject users with password less than 8 characters', function() {
        const testUser = { fullname, password: 'abc', username };
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal(
              'Must be at least 8 characters long'
            );
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.location).to.equal('password');
          });
      });

      it('Should reject users with password more than 30 characters', function() {
        const testUser = {
          fullname,
          password: 'abcdefghijklmnopqrstuvwxyz123456789',
          username
        };
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal(
              'Must be at most 30 characters long'
            );
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.location).to.equal('password');
          });
      });

      it('Should reject users with duplicate username', function() {
        const testUser = { fullname, username, password };
        return User.create(testUser).then(() => {
          return chai
            .request(app)
            .post('/api/users')
            .send(testUser);
        })
          .then(res => {
            expect(res.body.message).to.equal('The username already exists');
          });
      });


      /**
       * COMPLETE ALL THE FOLLOWING TESTS
       */

      it('Should trim fullname', function() {
        const testUser = { username, password, fullname: ` ${fullname} ` };
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'createdAt',
              'id',
              'updatedAt',
              'fullname'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.fullname).to.equal(fullname);
            return User.findOne({
              username
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.fullname).to.equal(fullname);
          });
      });




    });
  });
});
