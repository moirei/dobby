module.exports = {
  title: "Dobby",
  description: "GraphQL data models made easy.",
  base: "/dobby/",
  themeConfig: {
    // logo: '/logo.png',
    repo: "moirei/dobby",
    repoLabel: "Github",
    docsRepo: "moirei/dobby",
    docsDir: "docs",
    docsBranch: "master",
    sidebar: [
      {
        title: "Configuration",
        collapsable: true,
        sidebarDepth: 1,
        path: "/configuration",
      },
      {
        title: "Models",
        collapsable: false,
        sidebarDepth: 1,
        children: [
          "/guide/models/define-models",
          "/guide/models/conventions",
          "/guide/models/crud",
          "/guide/models/fields",
          "/guide/models/decorators",
          "/guide/models/hooks",
          "/guide/models/customising-models",
        ],
      },
      {
        title: "Query Builder",
        path: "/guide/query-builder/",
        collapsable: false,
        children: [
          "/guide/query-builder/select-fields",
          "/guide/query-builder/query-arguments",
          "/guide/query-builder/relationships",
          "/guide/query-builder/dynamic-query-operations",
        ],
      },
      {
        title: "Adapters",
        collapsable: false,
        path: "/guide/adapters",
      },
    ],
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/installation" },
      // { text: 'External', link: 'https://moirei.com', target:'_self', rel:false },
    ],
  },
  head: [
    ["link", { rel: "icon", href: "/logo.png" }],
    // ['link', { rel: 'manifest', href: '/manifest.json' }],
    ["meta", { name: "theme-color", content: "#3eaf7c" }],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    [
      "meta",
      { name: "apple-mobile-web-app-status-bar-style", content: "black" },
    ],
    [
      "link",
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon-152x152.png" },
    ],
    // ['link', { rel: 'mask-icon', href: '/icons/safari-pinned-tab.svg', color: '#3eaf7c' }],
    [
      "meta",
      {
        name: "msapplication-TileImage",
        content: "/icons/msapplication-icon-144x144.png",
      },
    ],
    ["meta", { name: "msapplication-TileColor", content: "#000000" }],
  ],
  plugins: [
    "@vuepress/active-header-links",
    "@vuepress/pwa",
    [
      "@vuepress/search",
      {
        searchMaxSuggestions: 10,
      },
    ],
    "seo",
  ],
};
