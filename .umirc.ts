import { defineConfig } from 'umi';

export default defineConfig({
  base: '/shengdan/',
  publicPath: '/shengdan/',
  title: '圣诞',
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
  headScripts: [{
    // src: 'https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.js'
  }]
});
