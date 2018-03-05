var should = require('should');
var request = require('supertest');
var expect = require('chai').expect;
var server = require('../../../app');
var inputData = require('./testInput');
var appPath = '/v2/components/publisher/org/test14nov/labs';
var Bearer = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik5EUTFORGs0UkRZMk5UTkNRa1EwUlVNelFVSXhNVEE1TVRnNE56VTFOelF5T1RNd05VSXhSUSJ9.eyJodHRwczovL3N5c2dhaW4ubmV3Z2VuLmNvbS91c2VyX21ldGFkYXRhIjp7InRuYyI6dHJ1ZSwicmVxdWVzdGVkX2FjY2VzcyI6IkRlbW8gTGFicyIsImFjY2Vzc19yZWFzb24iOiJ0ZXN0In0sImh0dHBzOi8vc3lzZ2Fpbi5uZXdnZW4uY29tL2FwcF9tZXRhZGF0YSI6eyJwZXJtaXNzaW9ucyI6eyJvcmdzIjpbeyJ0ZXN0MTRub3YiOnsidGVhbXMiOlt7InRlYW0iOiJ0ZXN0MTRub3YiLCJyb2xlIjoiYWRtaW4ifV19fSx7InRlc3QiOnsidGVhbXMiOlt7InRlYW0iOiJ0ZXN0MTRub3YiLCJyb2xlIjoicHVibGlzaGVyIn1dfX1dfSwidXNlclR5cGUiOiJwdWJsaXNoZXIiLCJzdGF0dXMiOiJhcHByb3ZlZCIsInBob25lX251bWJlciI6IjEyMzQ1Njc4OTAiLCJ1c2VybmFtZSI6InRlc3QxNG5vdiIsImV1bGFfdmVyc2lvbiI6IjEuMSJ9LCJodHRwczovL3N5c2dhaW4ubmV3Z2VuLmNvbS9jcmVhdGVkX2F0IjoiMjAxNy0xMS0xNFQxMTowODoxMC43MjBaIiwiaHR0cHM6Ly9zeXNnYWluLm5ld2dlbi5jb20vbmFtZSI6InRlc3QxNG5vdiIsImVtYWlsIjoidGVzdDE0bm92QHRlc3QuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJpc3MiOiJodHRwczovL2RocnV2bmV3Z2VuLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw1YTBhY2U5YTY4OGY2ZTQ3MDMwYWIwZTMiLCJhdWQiOiJIeVdFbVRLOUZoZnRjT2JUcmFoMzJjOFpyVmQxZUdRVCIsImlhdCI6MTUxNTM5MTAxNiwiZXhwIjoxNTE1NDI3MDE2fQ.x8A65a0UsWxNMTn5h3OrgDoMtX_lWQ7jozkaA88Ah_gEWtgPgT7jmv3fYYm8UTZ9jnOflaWBWOwchI7e6DYmiFhpkhqg5OyIzjatJhWLEqsFgLADn7UTByTFQjL5xYaV-ff9eJw6iCeHumPhiTBY9sMhxheCGgPHM_I4qhrsRNv8KI-qqaMLacmvJLd__Pf38V2-iN9Ry6LMmw027w-NfKB1fL7oivV-Si3wOcrRrN70qCYdqlEMvHzoWAVW5fmc32d-ncOngxhkH2on5fyv5ZQItvhdYUVlT8XwQOemkNAUvEqLgM_3aDQ--zvBdqpOFK62bW9AmAiHcMqGkPPUzw'

describe('lab Service', function () {
    var labId;
    it('creating a lab', function (done) {
        request(server)
            .post(appPath)
            .set('Accept', 'application/json')
            .set('Authorization', Bearer)
            .send(inputData.labCreateInput)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res.body).to.have.property('data')
                labId = res.body.data.labId;
                done();
            });
    });

    it('creating a connection', function (done) {
        request(server)
            .post(appPath + "/" + labId + "/connections")
            .set('Accept', 'application/json')
            .set('Authorization', Bearer)
            .send(inputData.connectionInput)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res.body).to.have.property('data')
                done();
            });
    });

    it('update a connection', function (done) {
        request(server)
            .put(appPath + "/" + labId + "/connections/123")
            .set('Accept', 'application/json')
            .set('Authorization', Bearer)
            .send(inputData.connectionUpdateInput)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res.body).to.have.property('data')
                done();
            });
    });

    it('get all lab', function (done) {
        request(server)
            .get(appPath)
            .set('Accept', 'application/json')
            .set('Authorization', Bearer)
            .expect(200)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res.body).to.have.property('data');
                done();
            });
    });

    it('get lab details', function (done) {
        request(server)
            .get(appPath + '/' + labId)
            .set('Accept', 'application/json')
            .set('Authorization', Bearer)
            .expect(200)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res.body).to.have.property('data');
                done();
            });
    });

    it('get admin  lab details', function (done) {
        request(server)
            .get(appPath + '/user/admin/')
            .set('Accept', 'application/json')
            .set('Authorization', Bearer)
            .expect(200)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res.body).to.have.property('data');
                done();
            });
    });

    it('get status review lab details', function (done) {
        request(server)
            .get(appPath + '/status/review/')
            .set('Accept', 'application/json')
            .set('Authorization', Bearer)
            .expect(200)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res.body).to.have.property('data');
                done();
            });
    });

    it('updating a lab', function (done) {
        request(server)
            .put(appPath + '/' + labId)
            .set('Accept', 'application/json')
            .set('Authorization', Bearer)
            .send(inputData.labUpdateInput)
            .expect(200)
            .end(function (err, res) {
                should.not.exist(err);
                expect(res.body).to.have.property('data');
                done();
            });
    });

    it('deleting a lab', function (done) {
        request(server)
            .delete(appPath + '/' + labId)
            .set('Accept', 'application/json')
            .set('Authorization', Bearer)
            .expect(200)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res.body).to.have.property('data');
                done();
            });
    });
});

after(function () {
    process.exit(0)
});

