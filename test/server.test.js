const chai = require('chai');
const chaiHttp = require('chai-http');
const { startServer, api, closeServer } = require('../server');
let expect = chai.expect;
let server;

chai.use(chaiHttp);

describe('Server API Endpoints', function() {
  before(async function() {
    server = startServer(0);
    // Wait for server to be ready
    await new Promise(res => setTimeout(res, 300));
    api.csvDir = __dirname+"/test_data"; // Set a test directory for CSV files    
  });

  describe('GET /api/username-exists', function() {
    it('should return true for username "james"', function(done) {
      chai.request(server)
        .get('/api/username-exists')
        .query({ username: 'james' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('exists', true);
          done();
        });
    });

    it('should return false for username "john"', function(done) {
      chai.request(server)
        .get('/api/username-exists')
        .query({ username: 'john' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('exists', false);
          done();
        });
    });
  });
});