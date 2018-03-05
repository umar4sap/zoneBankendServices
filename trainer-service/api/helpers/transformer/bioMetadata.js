'use strict'

bioMetadata.prototype.bio = {}
bioMetadata.prototype.bio.bioInfo = {}
bioMetadata.prototype.bio.bioSettings = {}

function bioMetadata(data, userId, tenantId,orgId) {
    bioMetadata.prototype.bio = {};
    var biodata;
    if ((typeof data) === "string") {
        biodata = Json.parse(data);
    } else {
        biodata = data;
    }

    bioMetadata.prototype.bio.fullName = biodata.fullName;
    bioMetadata.prototype.bio.email = biodata.email;
    bioMetadata.prototype.bio.bioDescription = biodata.bioDescription;
    bioMetadata.prototype.bio.orgName = biodata.orgName;
    bioMetadata.prototype.bio.authorImage = biodata.authorImage;
    bioMetadata.prototype.bio.designation  = biodata.designation ;
    bioMetadata.prototype.bio.ratings = biodata.ratings;
    bioMetadata.prototype.bio.socialLinks = biodata.socialLinks;
    bioMetadata.prototype.bio.keySkills = biodata.keySkills;
    bioMetadata.prototype.bio.tenantIduserId = tenantId + ':' + userId;
    bioMetadata.prototype.bio.tenantId = tenantId;
    bioMetadata.prototype.bio.userId = userId;
    bioMetadata.prototype.bio.authorId = userId;
    bioMetadata.prototype.bio.orgId = orgId;
    bioMetadata.prototype.bio.createdDTS = biodata.createdDTS;
    bioMetadata.prototype.bio.updatedDTS = biodata.updatedDTS;
}

bioMetadata.prototype.getData = function () {
    return bioMetadata.prototype.bio;
}

module.exports = bioMetadata;
