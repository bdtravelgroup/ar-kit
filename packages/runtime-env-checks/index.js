module.exports.isClient = function isClient() {
  return typeof window !== 'undefined' && typeof global === 'undefined';
};

module.exports.isServer = function isServer() {
  return typeof window === 'undefined' && typeof global !== 'undefined';
};
