import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Ten shades each, lightest to darkest. Shade 6 is the brand value.
const crimson: MantineColorsTuple = [
  '#ffe9ec',
  '#fcd2d7',
  '#f4a2ad',
  '#ec6f80',
  '#e5455a',
  '#e02a42',
  '#c8102e',
  '#b00826',
  '#9b111e',
  '#86001a',
];

const amethyst: MantineColorsTuple = [
  '#f5eefa',
  '#e4d8ee',
  '#c9addf',
  '#ad80d0',
  '#955bc3',
  '#8643bb',
  '#7d37b8',
  '#6b2aa1',
  '#5f2491',
  '#4b1e6b',
];

const sky: MantineColorsTuple = [
  '#e3f8ff',
  '#d0ecfa',
  '#a5d7f1',
  '#76c1e9',
  '#5ec8f2',
  '#3aa3d9',
  '#2a9bd6',
  '#1787bf',
  '#0078ab',
  '#006897',
];

export const theme = createTheme({
  primaryColor: 'crimson',
  primaryShade: 6,
  colors: { crimson, amethyst, sky },
  black: '#0a0a0b',
  white: '#ededed',
  fontFamily: "'Inter Variable', system-ui, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono Variable', ui-monospace, monospace",
  headings: {
    fontFamily: "'Oswald Variable', 'Arial Narrow', sans-serif",
    fontWeight: '600',
  },
  defaultRadius: 'sm',
  cursorType: 'pointer',
});
