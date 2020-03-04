module.exports = api => {
  api.cache.forever();

  return {
    presets: [
      [
        '@babel/env',
        {
          targets: {
            node: 'current'
          }
        }
      ],
      '@babel/preset-react',
      '@babel/preset-typescript'
    ],
    plugins: [
      '@ar-kit/babel-plugin-controller-add-displayname',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-classes',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator'
    ]
  };
};
