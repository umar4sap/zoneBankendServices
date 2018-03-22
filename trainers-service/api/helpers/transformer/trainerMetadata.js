'use strict'

trainerMetadata.prototype.trainer = {};

function trainerMetadata(data, userId, tenantId, zoneId) {
    trainerMetadata.prototype.trainer = {};
    var typedata;
    if ((typeof data) === "string") {
        typedata = JSON.parse(data);
    } else {
        typedata = data;
    }

    trainerMetadata.prototype.trainer.createdBy = userId;
    trainerMetadata.prototype.trainer.zoneId = zoneId;
    trainerMetadata.prototype.trainer.name = typedata.name;
    trainerMetadata.prototype.trainer.description = typedata.description;
    trainerMetadata.prototype.trainer.photo = typedata.photo;
    trainerMetadata.prototype.trainer.deparment = typedata.deparment;
    trainerMetadata.prototype.trainer.zoneName = typedata.zoneName;
    trainerMetadata.prototype.trainer.zoneName = typedata.zoneName;
    trainerMetadata.prototype.trainer.monthlySalary = typedata.monthlySalary;
    trainerMetadata.prototype.trainer.joiningDate = typedata.joiningDate;
    trainerMetadata.prototype.trainer.payoutDate = typedata.payoutDate;


}

trainerMetadata.prototype.getData = function() {
    return trainerMetadata.prototype.trainer;
}

module.exports = trainerMetadata;