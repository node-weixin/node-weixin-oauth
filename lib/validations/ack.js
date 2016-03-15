module.exports = {
  signature: {
    type: 'string',
    minLength: 3,
    maxLength: 64,
    required: true
  },

  timestamp: {
    type: 'int',
    required: true
  },
  nonce: {
    type: 'string',
    required: true
  },
  echostr: {
    type: 'string',
    required: true
  }
};
