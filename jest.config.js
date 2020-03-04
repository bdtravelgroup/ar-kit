module.exports = {
  verbose: true,
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy'
  },
  testPathIgnorePatterns: ['/node_modules/', 'fixtures', '__snapshots__', '/dist/', '__mocks__', 'compiler.js']
};
