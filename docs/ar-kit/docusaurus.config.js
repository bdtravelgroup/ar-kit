module.exports = {
  title: '@ar-kit',
  tagline: 'ar(eact)-kit, simple.',
  url: 'https://ar-kit.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'nicolasgarfinkiel', // Usually your GitHub org/user name.
  projectName: 'ar-kit', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: '@ar-kit',
      logo: {
        alt: '@ar-kit',
        src: 'img/logo.svg',
      },
      links: [
        {to: 'docs/get-started', label: 'Docs', position: 'left'},
        // {to: 'blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/nicolasgarfinkiel/ar-kit',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Cómo Empezar',
              to: 'docs/get-started',
            },
          ],
        },
        // {
        //   title: 'Community',
        //   items: [
        //     {
        //       label: 'Stack Overflow',
        //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
        //     },
        //     {
        //       label: 'Discord',
        //       href: 'https://discordapp.com/invite/docusaurus',
        //     },
        //   ],
        // },
        // {
        //   title: 'Social',
        //   items: [
        //     {
        //       label: 'Blog',
        //       to: 'blog',
        //     },
        //     {
        //       label: 'GitHub',
        //       href: 'https://github.com/facebook/docusaurus',
        //     },
        //     {
        //       label: 'Twitter',
        //       href: 'https://twitter.com/docusaurus',
        //     },
        //   ],
        // },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} @ar-kit. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: null,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
