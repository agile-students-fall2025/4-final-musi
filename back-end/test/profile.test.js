const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Profile API Tests', () => {
  
  describe('GET /api/profile', () => {
    it('should return profile data with all required fields', (done) => {
      chai.request(app)
        .get('/api/profile')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('profile');
          expect(res.body).to.have.property('activity');
          expect(res.body).to.have.property('taste');
          
          // Check profile structure
          expect(res.body.profile).to.have.property('name');
          expect(res.body.profile).to.have.property('username');
          expect(res.body.profile).to.have.property('bio');
          expect(res.body.profile).to.have.property('streakDays');
          
          done();
        });
    });

    it('should return activity array', (done) => {
      chai.request(app)
        .get('/api/profile')
        .end((err, res) => {
          expect(res.body.activity).to.be.an('array');
          if (res.body.activity.length > 0) {
            expect(res.body.activity[0]).to.have.property('id');
            expect(res.body.activity[0]).to.have.property('user');
            expect(res.body.activity[0]).to.have.property('rating');
          }
          done();
        });
    });

    it('should return taste data with genres and top tracks', (done) => {
      chai.request(app)
        .get('/api/profile')
        .end((err, res) => {
          expect(res.body.taste).to.have.property('genres');
          expect(res.body.taste).to.have.property('topTracks');
          expect(res.body.taste).to.have.property('insights');
          
          expect(res.body.taste.genres).to.be.an('array');
          expect(res.body.taste.topTracks).to.be.an('array');
          
          done();
        });
    });
  });

  describe('PUT /api/profile', () => {
    it('should update profile name', (done) => {
      chai.request(app)
        .put('/api/profile')
        .send({ name: 'John Doe' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('ok', true);
          expect(res.body.profile.name).to.equal('John Doe');
          done();
        });
    });

    it('should update profile username', (done) => {
      chai.request(app)
        .put('/api/profile')
        .send({ username: 'newusername' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.profile.username).to.equal('newusername');
          done();
        });
    });

    it('should update profile bio', (done) => {
      chai.request(app)
        .put('/api/profile')
        .send({ bio: 'New bio text' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.profile.bio).to.equal('New bio text');
          done();
        });
    });

    it('should trim whitespace from updates', (done) => {
      chai.request(app)
        .put('/api/profile')
        .send({ name: '  Trimmed Name  ' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.profile.name).to.equal('Trimmed Name');
          done();
        });
    });

    it('should return 400 for empty update', (done) => {
      chai.request(app)
        .put('/api/profile')
        .send({ name: '   ' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error');
          done();
        });
    });

    it('should ignore invalid fields', (done) => {
      chai.request(app)
        .put('/api/profile')
        .send({ invalidField: 'test', name: 'Valid Name' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.profile).to.not.have.property('invalidField');
          expect(res.body.profile.name).to.equal('Valid Name');
          done();
        });
    });
  });

  describe('POST /api/profile/activity/:id/like', () => {
    it('should toggle like on activity item', (done) => {
      chai.request(app)
        .post('/api/profile/activity/1/like')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('ok', true);
          expect(res.body).to.have.property('id', 1);
          done();
        });
    });

    it('should return 404 for non-existent activity', (done) => {
      chai.request(app)
        .post('/api/profile/activity/9999/like')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('error');
          done();
        });
    });

    it('should toggle like back and forth', (done) => {
      // First like
      chai.request(app)
        .post('/api/profile/activity/1/like')
        .end((err, res1) => {
          expect(res1).to.have.status(200);
          
          // Unlike
          chai.request(app)
            .post('/api/profile/activity/1/like')
            .end((err, res2) => {
              expect(res2).to.have.status(200);
              done();
            });
        });
    });
  });

  describe('GET /api/streak', () => {
    it('should return current streak data', (done) => {
      chai.request(app)
        .get('/api/streak')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('currentStreak');
          expect(res.body).to.have.property('lastActivity');
          expect(res.body).to.have.property('streakHistory');
          expect(res.body.streakHistory).to.be.an('array');
          done();
        });
    });

    it('should return streak as a number', (done) => {
      chai.request(app)
        .get('/api/streak')
        .end((err, res) => {
          expect(res.body.currentStreak).to.be.a('number');
          expect(res.body.currentStreak).to.be.at.least(0);
          done();
        });
    });
  });

  describe('POST /api/streak/activity', () => {
    it('should record new activity', (done) => {
      chai.request(app)
        .post('/api/streak/activity')
        .send({ activity: 'listened' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('currentStreak');
          expect(res.body).to.have.property('streakMaintained', true);
          done();
        });
    });

    it('should return 400 without activity type', (done) => {
      chai.request(app)
        .post('/api/streak/activity')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error');
          done();
        });
    });

    it('should handle duplicate activity on same day', (done) => {
      chai.request(app)
        .post('/api/streak/activity')
        .send({ activity: 'rated' })
        .end((err, res1) => {
          expect(res1).to.have.status(200);
          
          // Try again same day
          chai.request(app)
            .post('/api/streak/activity')
            .send({ activity: 'rated' })
            .end((err, res2) => {
              expect(res2).to.have.status(200);
              done();
            });
        });
    });
  });

  describe('POST /api/streak/reset', () => {
    it('should reset streak to zero', (done) => {
      chai.request(app)
        .post('/api/streak/reset')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('currentStreak', 0);
          done();
        });
    });

    it('should clear streak history after reset', (done) => {
      chai.request(app)
        .post('/api/streak/reset')
        .end((err, res) => {
          expect(res).to.have.status(200);
          
          // Verify streak is zero
          chai.request(app)
            .get('/api/streak')
            .end((err, res2) => {
              expect(res2.body.currentStreak).to.equal(0);
              done();
            });
        });
    });
  });

  describe('GET /api/followers/:username', () => {
    it('should return followers and following lists', (done) => {
      chai.request(app)
        .get('/api/followers/testuser')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('followers');
          expect(res.body).to.have.property('following');
          expect(res.body.followers).to.be.an('array');
          expect(res.body.following).to.be.an('array');
          done();
        });
    });
  });
});