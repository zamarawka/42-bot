const svgFiles = '.svg(\\?url)?$';
const cssFiles = '.(s)?css$';

function includeGroup(term) {
  return `(?<=${term})`;
}

function excludeGroup(term) {
  return `(?<!${term})`;
}

const includeSvg = includeGroup(svgFiles);
const excludeSvg = excludeGroup(svgFiles);

const includeCss = includeGroup(cssFiles);
const excludeCss = excludeGroup(cssFiles);

const config = {
  tabWidth: 2,
  useTabs: false,
  printWidth: 100,
  semi: true,
  jsxSingleQuote: false,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  endOfLine: 'lf',
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    `^@/(?!ui/)(.*)${excludeSvg}$`,
    `^@/ui/(.*)${excludeCss}$`,
    `^[./](.*)${excludeCss}$`,
    `^@/(.*)${includeCss}$`,
    `^[./](.*)${includeCss}$`,
    `^(.*)${includeSvg}$`,
  ],
  importOrderParserPlugins: ['typescript', 'classProperties', 'decorators-legacy'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default config;
