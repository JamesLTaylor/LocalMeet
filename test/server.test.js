// const chai = await import('chai')
const chai = require('chai');
let chaiHttp;
const { startServer, app } = require('../server');
let server;
const expect = chai.expect;

// describe('basic assert', () => expect('Alice').to.equal('Alice'));

describe('Server API Endpoints', function() {


  before(async function() {
    // Dynamically import chai-http (ESM)
    chaiHttp = (await import('chai-http')).default;
    chai.use(chaiHttp);
    // Start the server on a test port
    server = startServer(0); // 0 lets the OS pick a free port
    // Wait for server to be ready
    await new Promise(res => setTimeout(res, 300));
  });

  after(function(done) {
    // Close the server after tests
    if (server && server.close) server.close(done);
    else done();
  });
  describe('basic assert', function() {
    it('should equal Alice', function() {
      expect('Alice').to.equal('Alice');
    });
  });

  describe('POST /api/login', function() {
    it('should return 401 for invalid credentials', function(done) {
      chai.request(server)
        .post('/api/login')
        .send({ email: 'fake@example.com', password: 'wrong' })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('success', false);
          done();
        });
    });
  });
});