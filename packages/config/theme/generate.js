import fs from 'node:fs/promises';
import Color from 'colorjs.io';

function generateHslThemeFromMaterialThemeBuilder(theme) {
  const hslMap = new Map();
  Object.entries(theme).forEach(([name, value]) => {
    const match = new Color(value)
      .to('hsl')
      .toString({ precision: 3 })
      .match(/hsl\((?<color>[\d.]+ [\d.]+% [\d.]+%)\)/);
    if (match) {
      hslMap.set(`--nou-${kebabize(name)}`, match?.groups.color);
    }
  });
  return Array.from(hslMap.entries())
    .map((entry) => entry.join(': '))
    .join(';\n');
}

const mdTheme = JSON.parse(await fs.readFile(process.argv.at(2)));
const lightColors = generateHslThemeFromMaterialThemeBuilder(
  mdTheme.schemes.light,
);
const darkColors = generateHslThemeFromMaterialThemeBuilder(
  mdTheme.schemes.dark,
);
const baseCss = await fs.readFile(new URL('./base.css', import.meta.url));

const themeCss = /* css */ `
@layer base {
  :root,
  ::backdrop,
  ::selection {
    ${lightColors}
  }
  .dark {
    ${darkColors}
  }
}
`;

await fs.writeFile(
  new URL('./global.css', import.meta.url),
  `${baseCss}\n${themeCss}`,
);

/** Stolen from the Internets */
function kebabize(str) {
  return str
    .split('')
    .map((letter, idx) => {
      return letter.toUpperCase() === letter
        ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}`
        : letter;
    })
    .join('');
}
