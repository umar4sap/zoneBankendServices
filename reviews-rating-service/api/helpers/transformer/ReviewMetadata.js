'use strict'

reviewMetadata.prototype.review = {}
reviewMetadata.prototype.review.reviewInfo = {}
reviewMetadata.prototype.review.reviewSettings = {}

function reviewMetadata(data, userId, tenantId,orgId) {
    reviewMetadata.prototype.review = {};
    var reviewdata;
    if ((typeof data) === "string") {
        reviewdata = Json.parse(data);
    } else {
        reviewdata = data;
    }

    reviewMetadata.prototype.review.userName = reviewdata.userName;
    reviewMetadata.prototype.review.userEmail = reviewdata.userEmail;
    reviewMetadata.prototype.review.userId = reviewdata.userId;
    reviewMetadata.prototype.review.rating = reviewdata.rating;
    reviewMetadata.prototype.review.reviewedMessage = reviewdata.reviewedMessage;
    reviewMetadata.prototype.review.createdDTS = reviewdata.createdDTS;
    reviewMetadata.prototype.review.updatedDTS = reviewdata.updatedDTS;
    reviewMetadata.prototype.review.status="inReview" ;
    reviewMetadata.prototype.review.remark="" ;
    reviewMetadata.prototype.review.publisherRepalies=[];
    
}

reviewMetadata.prototype.getData = function () {
    return reviewMetadata.prototype.review;
}


function reviewPublishersMetadata(data, userId, tenantId,orgId) {
    reviewPublishersMetadata.prototype.replied = {};
    var reviewpublisherdata;
    if ((typeof data) === "string") {
        reviewpublisherdata = Json.parse(data);
    } else {
        reviewpublisherdata = data;
    }

    reviewPublishersMetadata.prototype.replied.publisherName = reviewpublisherdata.publisherName;
    reviewPublishersMetadata.prototype.replied.publisherEmail = reviewpublisherdata.userEmail;
    reviewPublishersMetadata.prototype.replied.repaliedMessage = reviewpublisherdata.repaliedMessage;
    
    reviewPublishersMetadata.prototype.replied.createdDTS = reviewpublisherdata.createdDTS;
    reviewPublishersMetadata.prototype.replied.updatedDTS = reviewpublisherdata.updatedDTS;
    
}

reviewPublishersMetadata.prototype.getData = function () {
    return reviewPublishersMetadata.prototype.replied;
}
module.exports = reviewMetadata,reviewPublishersMetadata;