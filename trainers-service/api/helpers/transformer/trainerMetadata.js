'use strict'

trainerMetadata.prototype.trainer = {};

function trainerMetadata(data, userId, tenantId, orgId) {
    trainerMetadata.prototype.trainer = {};
    var typedata;
    if ((typeof data) === "string") {
        typedata = JSON.parse(data);
    } else {
        typedata = data;
    }

    trainerMetadata.prototype.trainer.createdBy = userId;
    trainerMetadata.prototype.trainer.orgId = orgId;
    trainerMetadata.prototype.trainer.name = typedata.name;
    trainerMetadata.prototype.trainer.description = typedata.description;
    trainerMetadata.prototype.trainer.logo = typedata.logo;
    trainerMetadata.prototype.trainer.assignedStreamId = typedata.assignedStreamId;
    trainerMetadata.prototype.trainer.createdDTS = typedata.createdDTS;


}

trainerMetadata.prototype.getData = function() {
    return trainerMetadata.prototype.trainer;
}

module.exports = trainerMetadata;