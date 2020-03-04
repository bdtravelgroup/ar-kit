#!/usr/bin/env node

const { DIR, PORT, PREFIX, ROUTES_PATH, ALIASES_PATH } = process.env;

const proxyDevServer = require('./next-proxy-dev-server');
// eslint-disable-next-line import/no-dynamic-require
const proxyRoutes = require(ROUTES_PATH);
// eslint-disable-next-line import/no-dynamic-require
const proxyAliases = require(ALIASES_PATH);

proxyDevServer({
  dir: DIR || '.',
  port: parseInt(PORT, 10) || 3000,
  prefix: PREFIX || '/api',
  routerSetup: (proxyRouter, proxyAliasMapper) => {
    proxyRoutes(proxyRouter);
    proxyAliasMapper(proxyAliases);
  }
});
