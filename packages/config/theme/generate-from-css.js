import fs from 'node:fs/promises';
import Color from 'colorjs.io';

function generateHslThemeFromMaterialThemeBuilder(themeMap) {
  const hslMap = new Map();
  for (const [name, value] of themeMap.entries()) {
    const match = new Color(value)
      .to('hsl')
      .toString({ precision: 3 })
      .match(/hsl\((?<color>[\d.]+ [\d.]+% [\d.]+%)\)/);
    if (match) {
      hslMap.set(`--nou-${name}`, match?.groups.color);
    }
  }
  return Array.from(hslMap.entries())
    .map((entry) => entry.join(': '))
    .join(';\n');
}

const css = (
  await fs.readFile(new URL('./tokens.css', import.meta.url))
).toString();

const lightMap = new Map();
const darkMap = new Map();

css.split('\n').forEach((row) => {
  const match = row
    .trim()
    .match(/--md-sys-color-(?<token>.+)-(?<theme>light|dark): (?<hex>.+);/);
  if (match) {
    (match.groups.theme === 'light' ? lightMap : darkMap).set(
      match.groups.token.replace('--', '-'),
      match.groups.hex,
    );
  }
});

const lightColors = generateHslThemeFromMaterialThemeBuilder(lightMap);
const darkColors = generateHslThemeFromMaterialThemeBuilder(darkMap);
const baseCss = await fs.readFile(new URL('./base.css', import.meta.url));

const themeCss = /* css */ `
@layer base {
  :root {
    ${lightColors}
  }
  .dark {
    ${darkColors}
  }
}
`;

await fs.writeFile(
  new URL('../global.css', import.meta.url),
  `${baseCss}\n${themeCss}`,
);
