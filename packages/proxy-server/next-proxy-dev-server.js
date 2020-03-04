const Koa = require('koa');
const next = require('next');
const Router = require('koa-router');

module.exports = ({ dir, port, prefix, routerSetup }) => {
  const app = next({ dev: true, dir });
  const handle = app.getRequestHandler();
  app.prepare().then(() => {
    const server = new Koa();
    const router = new Router();
    const proxyRouter = new Router({ prefix });
    const proxyAliasMapper = aliases => {
      // eslint-disable-next-line no-restricted-syntax
      for (const alias of aliases) {
        const [from, to, qs] = alias;
        router.get(from, async ctx => {
          await app.render(ctx.req, ctx.res, to, typeof qs === 'object' ? { ...ctx.query, ...qs } : ctx.query);
          ctx.respond = false;
        });
      }
    };
    routerSetup(proxyRouter, proxyAliasMapper);
    router.use(proxyRouter.routes());
    router.all('*', async ctx => {
      await handle(ctx.req, ctx.res);
      ctx.respond = false;
    });
    server.use(async (ctx, nextAction) => {
      ctx.res.statusCode = 200;
      await nextAction();
    });
    server.use(router.routes());
    server.listen(port, () => {
      console.log(`> Ready on http://localhost:${port}`);
    });
  });
};
