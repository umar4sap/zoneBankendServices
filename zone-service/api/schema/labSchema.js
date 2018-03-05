var schema = require('validate');
var labSchema = schema({
  labName: {
    type: 'string',
    required: true,
    message: 'labName is required.'
  },
  tags: {
    type: 'array',
    required: false,
    message: 'tags is required.'
  },
  preRequisites: {
    type: 'string',
    required: true,
    message: 'preRequisites is required.'
  },
  emails: {
    type: 'array',
    required: true,
    message: 'email is an array required.'
  },
  organization: {
    type: 'string',
    required: true,
    message: 'organization is required.'
  },
  project: {
    type: 'object',
    required: true,
    message: 'project is an object required.'
  },

  icons: {
    type: 'array',
    required: true,
    message: 'icons is an array required.'
  },
  labImage: {
    type: 'object',
    required: true,
    message: 'labImage is an object required.'
  },
  images: {
    type: 'array',
    required: true,
    message: 'images is an array required.'
  },
  videos: {
    type: 'array',
    required: true,
    message: 'videos is an array required.'
  },
  configuration: {
    type: 'object',
    required: true,
    message: 'configuration is an object required.'
  },
  linkCloudPools: {
    type: 'array',
    required: true,
    message: 'linkCloudPools is an array required.'
  },
  longDescription: {
    type: 'string',
    required: true,
    message: 'longDescription is required.'
  },
  shortDescription: {
    type: 'string',
    required: true,
    message: 'shortDescription is required.'
  },
  skillLevel: {
    type: 'string',
    required: true,
    message: 'skillLevel is required.'
  },
  authors: {
    type: 'array',
    required: true,
    message: 'authors is an array required.'
  },
  supportingDocs: {
    type: 'array',
    required: true,
    message: 'supportingDocs is an array required.'
  },
  sections: {
    type: 'array',
    required: true,
    message: 'sections is an array required.'
  },
  status: {
    type: 'string',
    required: true,
    message: 'status is required.'
  },
    permissions:{
    type: 'object',
    required: true,
    message: 'permissions object is required.'
  }
});

var labDraft = schema({
  labName: {
    type: 'string',
    required: true,
    message: 'labName is required.'
  },
  shortDescription: {
    type: 'string',
    required: true,
    message: 'shortDescription is required.'
  },
  category: {
    type: 'string',
    required: true,
    message: 'category is required.'
  },
  preRequisites: {
    type: 'string',
    required: false,
    message: 'preRequisites is required.'
  },
  emails: {
    type: 'array',
    required: false,
    message: 'email is an array required.'
  },
  organization: {
    type: 'string',
    required: false,
    message: 'organization is required.'
  },
  project: {
    type: 'object',
    required: false,
    message: 'project is an object required.'
  },

  icons: {
    type: 'array',
    required: false,
    message: 'icons is an array required.'
  },
  labImage: {
    type: 'array',
    required: false,
    message: 'labImage is an object required.'
  },
  images: {
    type: 'array',
    required: false,
    message: 'images is an array required.'
  },
  videos: {
    type: 'array',
    required: false,
    message: 'videos is an array required.'
  },
  configuration: {
    type: 'object',
    required: false,
    message: 'configuration is an object required.'
  },
  linkCloudPools: {
    type: 'array',
    required: false,
    message: 'linkCloudPools is an array required.'
  },
  longDescription: {
    type: 'string',
    required: false,
    message: 'longDescription is required.'
  },

  skillLevel: {
    type: 'string',
    required: false,
    message: 'skillLevel is required.'
  },
  authors: {
    type: 'array',
    required: false,
    message: 'authors is an array required.'
  },
  supportingDocs: {
    type: 'array',
    required: false,
    message: 'supportingDocs is an array required.'
  },
  sections: {
    type: 'array',
    required: false,
    message: 'sections is an array required.'
  },
  status: {
    type: 'string',
    required: false,
    message: 'status is required.'
  },
  tags: {
    type: 'array',
    required: false,
    message: 'tags is required.'
  },
  permissions:{
    type: 'object',
    required: false,
    message: 'permissions object is required.'
  }

})

module.exports.labSchema = labSchema;
module.exports.labDraft = labDraft;






