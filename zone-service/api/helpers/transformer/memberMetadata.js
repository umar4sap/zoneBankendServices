'use strict'

memberMetadata.prototype.member = {}
memberMetadata.prototype.member.memberInfo = {}
memberMetadata.prototype.member.memberSettings = {}

function memberMetadata(data, userId, tenantId,orgId) {
    memberMetadata.prototype.member = {};
    var memberdata;
    if ((typeof data) === "string") {
        memberdata = Json.parse(data);
    } else {
        memberdata = data;
    }

    memberMetadata.prototype.member.memberName = memberdata.memberName;
    memberMetadata.prototype.member.memberAge = memberdata.memberAge;
    memberMetadata.prototype.member.memberCity = memberdata.memberCity;
    memberMetadata.prototype.member.MemberWeight = memberdata.MemberWeight;
    memberMetadata.prototype.member.userId = memberdata.userId;
    memberMetadata.prototype.member.memberStatus = "Waiting to confirm";
    memberMetadata.prototype.member.shiftTiming = memberdata.shiftTiming;
    memberMetadata.prototype.member.memberEmail = memberdata.memberEmail;
    memberMetadata.prototype.member.memberStartDate = memberdata.memberStartDate;
    memberMetadata.prototype.member.zoneId = memberdata.zoneId;
    memberMetadata.prototype.member.createdDTS = memberdata.createdDTS;
    memberMetadata.prototype.member.updatedDTS = memberdata.updatedDTS;
    memberMetadata.prototype.member.primaryContact = memberdata.primaryContact;
    memberMetadata.prototype.member.secondaryContact = memberdata.secondaryContact;
    memberMetadata.prototype.member.Memberheight = memberdata.Memberheight;
    memberMetadata.prototype.member.memberPhoto = memberdata.memberPhoto;
    memberMetadata.prototype.member.paymentStatus = memberdata.paymentStatus;
    memberMetadata.prototype.member.planDetails = memberdata.planDetails;
   
    
}

memberMetadata.prototype.getData = function () {
    return memberMetadata.prototype.member;
}


function memberPublishersMetadata(data, userId, tenantId,orgId) {
    memberPublishersMetadata.prototype.replied = {};
    var memberpublisherdata;
    if ((typeof data) === "string") {
        memberpublisherdata = Json.parse(data);
    } else {
        memberpublisherdata = data;
    }

    memberPublishersMetadata.prototype.replied.publisherName = memberpublisherdata.publisherName;
    memberPublishersMetadata.prototype.replied.publisherEmail = memberpublisherdata.userEmail;
    memberPublishersMetadata.prototype.replied.repaliedMessage = memberpublisherdata.repaliedMessage;
    
    memberPublishersMetadata.prototype.replied.createdDTS = memberpublisherdata.createdDTS;
    memberPublishersMetadata.prototype.replied.updatedDTS = memberpublisherdata.updatedDTS;
    
}

memberPublishersMetadata.prototype.getData = function () {
    return memberPublishersMetadata.prototype.replied;
}
module.exports = memberMetadata,memberPublishersMetadata;