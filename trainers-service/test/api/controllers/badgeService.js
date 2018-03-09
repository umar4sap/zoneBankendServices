var should = require('should');
var request = require('supertest');
var expect = require('chai').expect;
var server = require('../../../app');
var inputData = require('./testInput');
var zoneId = "test14nov";
var appPath = '/v2/components/trainer-service/zone/' + zoneId;
var Bearer = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik5EUTFORGs0UkRZMk5UTkNRa1EwUlVNelFVSXhNVEE1TVRnNE56VTFOelF5T1RNd05VSXhSUSJ9.eyJodHRwczovL3N5c2dhaW4ubmV3Z2VuLmNvbS91c2VyX21ldGFkYXRhIjp7InRuYyI6dHJ1ZSwicmVxdWVzdGVkX2FjY2VzcyI6IkRlbW8gTGFicyIsImFjY2Vzc19yZWFzb24iOiJ0ZXN0In0sImh0dHBzOi8vc3lzZ2Fpbi5uZXdnZW4uY29tL2FwcF9tZXRhZGF0YSI6eyJwZXJtaXNzaW9ucyI6eyJvcmdzIjpbeyJ0ZXN0MTRub3YiOnsidGVhbXMiOlt7InRlYW0iOiJ0ZXN0MTRub3YiLCJyb2xlIjoiYWRtaW4ifV19fSx7InRlc3QiOnsidGVhbXMiOlt7InRlYW0iOiJ0ZXN0MTRub3YiLCJyb2xlIjoicHVibGlzaGVyIn1dfX1dfSwidXNlclR5cGUiOiJwdWJsaXNoZXIiLCJzdGF0dXMiOiJhcHByb3ZlZCIsInBob25lX251bWJlciI6IjEyMzQ1Njc4OTAiLCJ1c2VybmFtZSI6InRlc3QxNG5vdiIsImV1bGFfdmVyc2lvbiI6IjEuMSJ9LCJodHRwczovL3N5c2dhaW4ubmV3Z2VuLmNvbS9jcmVhdGVkX2F0IjoiMjAxNy0xMS0xNFQxMTowODoxMC43MjBaIiwiaHR0cHM6Ly9zeXNnYWluLm5ld2dlbi5jb20vbmFtZSI6InRlc3QxNG5vdiIsImVtYWlsIjoidGVzdDE0bm92QHRlc3QuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJpc3MiOiJodHRwczovL2RocnV2bmV3Z2VuLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw1YTBhY2U5YTY4OGY2ZTQ3MDMwYWIwZTMiLCJhdWQiOiJIeVdFbVRLOUZoZnRjT2JUcmFoMzJjOFpyVmQxZUdRVCIsImlhdCI6MTUxNDQ0MjUzOCwiZXhwIjoxNTE0NDc4NTM4fQ.FlgqCRdzyoTDbGxCzFK-18C1MZMTgPBYv710_LtPhhb0PfgvvDrGP7G0RM2ySVxdVbhQkxnuF7Q4fGDCTNlP-kUFnR4HCS5V8Xe6rworVj6jLLEMJzT-H22AYEZcVK4nyPu6tIhlmibUmopuv1pRJlY_LjPaFMghyLf4x8zQfkDpgwn59Qy1n8CAAejOurNuzPFUZBNAj15Tb1NHc3XH-J7tMF0iFUv5vTF4vX4OxgpdPuBH2Ou6WeJt2bxHgxTA1_J7Yvlxpsb31_QKf3grYW9NttCDMAfdIJZj7p2QJCmkxnLpPbfE0qt0VuHeszuitvf4LlLlD5TQoA4LqzOeYg';
var trainerPath = appPath + '/trainers';



describe('connection Service', function() {
    var trainerId;

    it('creating a trainer', function(done) {
        request(server)
            .post(trainerPath)
            .set('Accept', 'application/json')
            .set('Authorization', Bearer)
            .send(inputData.trainerCreateInput)
            //.expect('Content-Type', 'application/json')
            .expect(200)
            .end(function(err, res) {
                // should.not.exist(err);
                expect(err).to.be.null;
                // res.body.should.have.property('inserted', 1);
                expect(res.body).to.have.property('inserted', 1)
                trainerId = res.body.generated_keys[0];
                inputData.connectionCreateInput.trainers[0].trainerId = trainerId
                done();
            });
    });
    it('updating a trainer', function(done) {

        request(server)
            .put(trainerPath + '/' + trainerId)
            .set('Accept', 'application/json')
            .set('Authorization', Bearer)
            .send(inputData.trainerUpdateInput)
            //.expect('Content-Type', 'application/json')
            .expect(200)
            .end(function(err, res) {
                should.not.exist(err);
                res.body.should.have.property('replaced').be.above(0);
                done();
            });
    });

    it('get all trainer', function(done) {
        request(server)
            .get(trainerPath)
            .set('Accept', 'application/json')
            .set('Authorization', Bearer)
            //.expect('Content-Type', 'application/json')
            .expect(200)
            .end(function(err, res) {
                // should.not.exist(err);
                expect(err).to.be.null;
                // res.body.should.be.instanceof(Array);
                expect(res.body).to.be.an('array').that.is.not.empty;
                done();
            });
    });


    it('get one trainer', function(done) {
        request(server)
            .get(trainerPath + '/' + trainerId)
            .set('Accept', 'application/json')
            .set('Authorization', Bearer)
            //.expect('Content-Type', 'application/json')
            .expect(200)
            .end(function(err, res) {
                // should.not.exist(err);
                expect(err).to.be.null;
                // res.body.should.be.instanceof(Array);
                expect(res.body).to.be.an('array').that.is.not.empty;
                done();
            });
    });

    it('deleting a trainer', function(done) {
        request(server)
            .delete(trainerPath + '/' + trainerId)
            .set('Accept', 'application/json')
            .set('Authorization', Bearer)
            //.expect('Content-Type', 'application/json')
            .expect(200)
            .end(function(err, res) {
                expect(err).to.be.null;
                // should.not.exist(err);
                // res.body.should.have.property('deleted').be.above(0);
                expect(res.body).to.have.property('deleted').above(0);
                done();
            });
    });
});

after(function() {
    process.exit(0)
});