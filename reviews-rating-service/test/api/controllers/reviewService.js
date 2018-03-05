var should = require('should');
var request = require('supertest');
var expect = require('chai').expect;
var server = require('../../../app');
var inputData = require('./testInput');
var appPath = '/v2/components/reviews-service';
var org="/orgs/test14nov";
var Bearer = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik5EUTFORGs0UkRZMk5UTkNRa1EwUlVNelFVSXhNVEE1TVRnNE56VTFOelF5T1RNd05VSXhSUSJ9.eyJodHRwczovL3N5c2dhaW4ubmV3Z2VuLmNvbS91c2VyX21ldGFkYXRhIjp7InRuYyI6dHJ1ZSwicmVxdWVzdGVkX2FjY2VzcyI6IkRlbW8gTGFicyIsImFjY2Vzc19yZWFzb24iOiJ0ZXN0In0sImh0dHBzOi8vc3lzZ2Fpbi5uZXdnZW4uY29tL2FwcF9tZXRhZGF0YSI6eyJwZXJtaXNzaW9ucyI6eyJvcmdzIjpbeyJ0ZXN0MTRub3YiOnsidGVhbXMiOlt7InRlYW0iOiJ0ZXN0MTRub3YiLCJyb2xlIjoiYWRtaW4ifV0sInBsYW5zIjpbXX19LHsidGVzdCI6eyJ0ZWFtcyI6W3sidGVhbSI6InRlc3QxNCIsInJvbGUiOiJwdWJsaXNoZXIifV0sInBsYW5zIjpbXX19LHsibXlkZWZhdWx0b3JnYWJjIjp7InRlYW1zIjpbeyJ0ZWFtIjoib3duZXJzIiwicm9sZSI6ImFkbWluIn1dLCJwbGFucyI6W3sic3Vic2NyaXB0aW9uX2lkIjoiQjRPRUdvUWhlYXNpa2dWTyIsInBsYW5faWQiOiJkZW1vbGFiLSYtc3RhY2stc3RhbmRhcmQiLCJzdGF0dXMiOiJhY3RpdmUifV19fSx7ImRzc2RkZCI6eyJ0ZWFtcyI6W3sidGVhbSI6Im93bmVycyIsInJvbGUiOiJhZG1pbiJ9XSwicGxhbnMiOltdfX0seyJkZHNzZGQiOnsidGVhbXMiOlt7InRlYW0iOiJvd25lcnMiLCJyb2xlIjoiYWRtaW4ifV0sInBsYW5zIjpbXX19LHsiYXNkIjp7InRlYW1zIjpbeyJ0ZWFtIjoib3duZXJzIiwicm9sZSI6ImFkbWluIn1dLCJwbGFucyI6W119fSx7ImFzZHNhZCI6eyJ0ZWFtcyI6W3sidGVhbSI6Im93bmVycyIsInJvbGUiOiJhZG1pbiJ9XSwicGxhbnMiOltdfX0seyJkZmdkZGZnIjp7InRlYW1zIjpbeyJ0ZWFtIjoib3duZXJzIiwicm9sZSI6ImFkbWluIn1dLCJwbGFucyI6W119fSx7InF3ZXEiOnsidGVhbXMiOlt7InRlYW0iOiJvd25lcnMiLCJyb2xlIjoiYWRtaW4ifV0sInBsYW5zIjpbXX19XX0sInVzZXJUeXBlIjoicHVibGlzaGVyIiwic3RhdHVzIjoiYXBwcm92ZWQiLCJwaG9uZV9udW1iZXIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJ0ZXN0MTRub3YiLCJldWxhX3ZlcnNpb24iOiIxLjEiLCJldWxhcyI6W3siaWQiOiJlMmRmNmVjYi04NTNmLTRiYzktOTc5Yi0xM2JjOTQ3YTEzMmMiLCJ2ZXJzaW9uIjoiMS4wIiwib3JnIjoidGVzdDE0bm92In0seyJpZCI6IjY1NjBjZTkzLTZmYjktNGFkOC1iYTIyLTBmNWE3NTRkZWFiNSIsInZlcnNpb24iOiIxLjAiLCJvcmciOiJ0ZXN0MTRub3YifSx7ImlkIjoiZTJkZjZlY2ItODUzZi00YmM5LTk3OWItMTNiYzk0N2ExMzJjIiwidmVyc2lvbiI6IjEuMiIsIm9yZyI6InRlc3QxNG5vdiJ9LHsiaWQiOiI2NTYwY2U5My02ZmI5LTRhZDgtYmEyMi0wZjVhNzU0ZGVhYjUiLCJ2ZXJzaW9uIjoiMS4xIiwib3JnIjoidGVzdDE0bm92In0seyJpZCI6ImUyZGY2ZWNiLTg1M2YtNGJjOS05NzliLTEzYmM5NDdhMTMyYyIsInZlcnNpb24iOiIxLjgiLCJvcmciOiJ0ZXN0MTRub3YifSx7ImlkIjoiMDdhNmY1OTctMjIwYi00NTU5LTgxNmYtODk0YTdhMmZjMzU1IiwidmVyc2lvbiI6IjIuMyIsIm9yZyI6InRlc3QxNG5vdiJ9LHsiaWQiOiI5YTI1MWM5Yi0wOWUyLTQ3NjEtOGExNy01MTdlZjg3ZDA1NDEiLCJ2ZXJzaW9uIjoiMS4wIiwib3JnIjoidGVzdDE0bm92In0seyJpZCI6IjI3NzFlNDBiLTM1OTctNDY2Ni1iZjcwLTg4ODFjZmY4Yzg0ZiIsInZlcnNpb24iOiIxLjEiLCJvcmciOiJ0ZXN0MTRub3YifSx7ImlkIjoiMS4wIiwidmVyc2lvbiI6IjEuMCIsIm9yZyI6Im9yYWNsZSJ9LHsiaWQiOiIxMC4wIiwidmVyc2lvbiI6IjEwLjAiLCJvcmciOiJhenVyZSJ9XX0sImh0dHBzOi8vc3lzZ2Fpbi5uZXdnZW4uY29tL2NyZWF0ZWRfYXQiOiIyMDE3LTExLTE0VDExOjA4OjEwLjcyMFoiLCJodHRwczovL3N5c2dhaW4ubmV3Z2VuLmNvbS9uYW1lIjoidGVzdDE0bm92IiwiZW1haWwiOiJ0ZXN0MTRub3ZAdGVzdC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vZGhydXZuZXdnZW4uYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVhMGFjZTlhNjg4ZjZlNDcwMzBhYjBlMyIsImF1ZCI6Ikh5V0VtVEs5RmhmdGNPYlRyYWgzMmM4WnJWZDFlR1FUIiwiaWF0IjoxNTE3ODA3MDc4LCJleHAiOjE1MTc4NDMwNzh9.VIryyIELi8x7HYXNcZmBsqTKCky1334lgwXE5xtNeHAaSKgPq7aej_6JzM77Ts3xjJkQwjdGtXCiyf2-ir5G6YVOsnXVpa0GR4mBATRTW12ygjGbRrR2mnlhfE3mMnlH-LVQO301sU31ROjvUn8bYxfJdv-B6ir6oeAtIMmSOtrmH15o6FrgBiktDy3_9R-J1p-lTpj-tRRkoppvsqhZ_CXyUw2L0KOlF4YKkxtZHiqRx9sTrISb6shmRgf5Bq-Iew8r1PemEvXWpccWjTzBUEb_VM44e1jwZBXCCxaw8UxXVKHICTbsISwJYWM2jXiwYHjrcr3e5qq9mqJRqLMn9A'

describe('reviews Service', function () {
    var componentId="18ce43c2-9bc4-4d59-9df1-24af77fd887a", reviewId;
    it('create a review', function (done) {
        request(server)
            .post(appPath+"/component/"+componentId+"/reviews")
            .set('Accept', 'application/json')
             .set("user_access", "true")
            .send(inputData.reviewCreateInput)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res.body).to.have.property('data')
                reviewId=res.body.data.reviewId;
                done();
            });
    });
    it('approve or reject review', function (done) {
        request(server)
            .patch(appPath+org+"/component/"+ componentId +"/reviews/"+reviewId+"/approval")
            .set('Accept', 'application/json')
            .set('Authorization', Bearer)
            .send(inputData.approveInput)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res.body).to.have.property('data')
                done();
            });
    });

    it('publisher replay', function (done) {
        request(server)
            .put(appPath+org+"/component/"+ componentId + "/reviews/"+reviewId)
            .set('Accept', 'application/json')
            .set('Authorization', Bearer)
            .send(inputData.replyInput)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res.body).to.have.property('data')
                done();
            });
    });

    it('get all reviews', function (done) {
        request(server)
            .get(appPath+"/component/"+componentId+"/reviews")
            .set('Accept', 'application/json')
             .set("user_access", "true")
            .expect(200)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res.body).to.have.property('data');
                done();
            });
    });

    it('get reviews details', function (done) {
        request(server)
            .get(appPath+"/component/"+componentId+"/reviews/"+reviewId)
            .set('Accept', 'application/json')
             .set("user_access", "true")
            .expect(200)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res.body).to.have.property('data');
                done();
            });
    });

     it('get all ratings', function (done) {
        request(server)
            .get(appPath+"/component/"+componentId+"/ratings")
            .set('Accept', 'application/json')
             .set("user_access", "true")
            .expect(200)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res.body).to.have.property('data');
                done();
            });
    });

    it('get all reviews for User', function (done) {
        request(server)
            .get(appPath+"/component/"+componentId+"/user/59c2c3047c2eab787c175fa2")
            .set('Accept', 'application/json')
             .set("user_access", "true")
            .expect(200)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res.body).to.have.property('data');
                done();
            });
    });

    it('update user review', function (done) {
        request(server)
            .put(appPath+"/component/"+componentId+"/user/59c2c3047c2eab787c175fa2")
            .set('Accept', 'application/json')
             .set("user_access", "true")
            .send(inputData.updateReviewInput)
            .expect(200)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res.body).to.have.property('data');
                done();
            });
    });


    it('deleting a review', function (done) {
        request(server)
            .delete(appPath +org+"/component/"+ componentId + "/reviews/"+reviewId)
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

