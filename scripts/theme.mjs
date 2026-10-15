import {readFileSync} from 'node:fs';

// Derive manual overrides from the installed Observable themes, including their
// syntax tokens. No separate light/dark palette is maintained by this project.
function nativeTheme(file) {
  const url=new URL(`../node_modules/@observablehq/framework/dist/style/${file}`,import.meta.url);
  return readFileSync(url,'utf8').replace(/@import "\.\/([^\"]+)";/g,(_,dependency)=>nativeTheme(dependency));
}
export function themeHead() {
  const css=[['light','theme-air.css'],['dark','theme-near-midnight.css']].map(([mode,file])=>
    (nativeTheme(file)+nativeTheme('theme-alt.css')).replaceAll(':root',`:root[data-theme="${mode}"]`)
  ).join('\n');
  const script=readFileSync(new URL('../src/components/theme.js',import.meta.url),'utf8');
  return `<style>${css}</style><script>${script}</script>`;
}
