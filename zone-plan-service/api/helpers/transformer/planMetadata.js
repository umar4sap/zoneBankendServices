'use strict'

planMetadata.prototype.plan = {};

function planMetadata(data, userId, tenantId, zoneId) {
    planMetadata.prototype.plan = {};
    var typedata;
    if ((typeof data) === "string") {
        typedata = JSON.parse(data);
    } else {
        typedata = data;
    }

    planMetadata.prototype.plan.createdBy = userId;
    planMetadata.prototype.plan.zoneId = zoneId;
    planMetadata.prototype.plan.planName = typedata.planName;
    planMetadata.prototype.plan.zoneName = typedata.zoneName;
    planMetadata.prototype.plan.planFee = typedata.planFee;
    planMetadata.prototype.plan.aboutPlan = typedata.aboutPlan;
    planMetadata.prototype.plan.planMonth = typedata.planMonth;
    planMetadata.prototype.plan.planOffer= typedata.planOffer;
    planMetadata.prototype.plan.offerValidity = typedata.offerValidity;
    planMetadata.prototype.plan.createdDTS = typedata.createdDTS;


}

planMetadata.prototype.getData = function() {
    return planMetadata.prototype.plan;
}

module.exports = planMetadata;