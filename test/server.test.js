const chai = require('chai');
const chaiHttp = require('chai-http');
const { startServer, api, closeServer } = require('../server');
let expect = chai.expect;
let server;

chai.use(chaiHttp);

// describe('basic assert', () => expect('Alice').to.equal('Alice'));

describe('Server API Endpoints', function() {


  before(async function() {
    server = startServer(0);
    // Wait for server to be ready
    await new Promise(res => setTimeout(res, 300));
    api.csvDir = __dirname+"/test_data"; // Set a test directory for CSV files    
  });

  // after(function(done) {
  //   // Close the server after tests
  //   closeServer(err => {
  //     if (err) console.error('Error closing server:', err);
  //     else done();
  //   });
  // });

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
  });
});