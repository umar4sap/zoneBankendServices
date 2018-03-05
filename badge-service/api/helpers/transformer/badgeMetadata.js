'use strict'

badgeMetadata.prototype.badge = {};

function badgeMetadata(data, userId, tenantId, orgId) {
    badgeMetadata.prototype.badge = {};
    var typedata;
    if ((typeof data) === "string") {
        typedata = JSON.parse(data);
    } else {
        typedata = data;
    }

    badgeMetadata.prototype.badge.createdBy = userId;
    badgeMetadata.prototype.badge.orgId = orgId;
    badgeMetadata.prototype.badge.name = typedata.name;
    badgeMetadata.prototype.badge.description = typedata.description;
    badgeMetadata.prototype.badge.logo = typedata.logo;
    badgeMetadata.prototype.badge.assignedStreamId = typedata.assignedStreamId;
    badgeMetadata.prototype.badge.createdDTS = typedata.createdDTS;


}

badgeMetadata.prototype.getData = function() {
    return badgeMetadata.prototype.badge;
}

module.exports = badgeMetadata;