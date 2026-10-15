import {themeHead} from './scripts/theme.mjs';

export default {
  title: 'Biology evaluations',
  root: 'src',
  output: 'dist',
  theme: ['air', 'near-midnight', 'alt', 'wide'],
  style: 'style.css',
  sidebar: false,
  pager: false,
  toc: false,
  search: true,
  base: '/bio-evals/',
  dynamicPaths: ['/github-status.json'],
  head: themeHead(),
  header: '<a href="https://github.com/Open-Athena/bio-evals">Open Athena · bio-evals ↗</a><label class="theme-preference">Theme <select id="theme-preference" aria-label="Color theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>',
  footer: 'A catalog of evaluations and their implementation work. Built with Observable Framework.'
};
