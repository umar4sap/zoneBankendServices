'use strict'

zoneMetadata.prototype.zone = {}
zoneMetadata.prototype.zone.zoneInfo = {}
zoneMetadata.prototype.zone.zoneSettings = {}

function zoneMetadata(data, userId, tenantId,orgId) {
    zoneMetadata.prototype.zone = {};
    var zonedata;
    if ((typeof data) === "string") {
        zonedata = Json.parse(data);
    } else {
        zonedata = data;
    }

    zoneMetadata.prototype.zone.zoneName = zonedata.zoneName;
    zoneMetadata.prototype.zone.zoneOwnerName = zonedata.zoneOwnerName;
    zoneMetadata.prototype.zone.zoneAddress = zonedata.zoneAddress;
    zoneMetadata.prototype.zone.zoneType = zonedata.zoneType;
    zoneMetadata.prototype.zone.zoneSince = zonedata.zoneSince;
    zoneMetadata.prototype.zone.zoneStatus = "inReview";
    zoneMetadata.prototype.zone.zoneTiming = zonedata.zoneTiming;
    zoneMetadata.prototype.zone.zoneEmail = zonedata.zoneEmail;
    zoneMetadata.prototype.zone.aboutZone = zonedata.aboutZone;
    zoneMetadata.prototype.zone.zoneShortDescription = zonedata.zoneShortDescription;
    zoneMetadata.prototype.zone.createdDTS = zonedata.createdDTS;
    zoneMetadata.prototype.zone.updatedDTS = zonedata.updatedDTS;
    zoneMetadata.prototype.zone.primaryContact = zonedata.primaryContact;
    zoneMetadata.prototype.zone.secondaryContact = zonedata.secondaryContact;
    zoneMetadata.prototype.zone.images = zonedata.images;
    zoneMetadata.prototype.zone.videos = zonedata.videos;
   
    
}

zoneMetadata.prototype.getData = function () {
    return zoneMetadata.prototype.zone;
}


function zonePublishersMetadata(data, userId, tenantId,orgId) {
    zonePublishersMetadata.prototype.replied = {};
    var zonepublisherdata;
    if ((typeof data) === "string") {
        zonepublisherdata = Json.parse(data);
    } else {
        zonepublisherdata = data;
    }

    zonePublishersMetadata.prototype.replied.publisherName = zonepublisherdata.publisherName;
    zonePublishersMetadata.prototype.replied.publisherEmail = zonepublisherdata.userEmail;
    zonePublishersMetadata.prototype.replied.repaliedMessage = zonepublisherdata.repaliedMessage;
    
    zonePublishersMetadata.prototype.replied.createdDTS = zonepublisherdata.createdDTS;
    zonePublishersMetadata.prototype.replied.updatedDTS = zonepublisherdata.updatedDTS;
    
}

zonePublishersMetadata.prototype.getData = function () {
    return zonePublishersMetadata.prototype.replied;
}
module.exports = zoneMetadata,zonePublishersMetadata;