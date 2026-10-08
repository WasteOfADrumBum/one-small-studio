import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import '@fontsource-variable/inter';
import '@fontsource-variable/oswald';
import '@fontsource-variable/jetbrains-mono';
import '@mantine/core/styles.css';
import './styles/global.css';
import { theme } from './theme';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} forceColorScheme="dark">
      <App />
    </MantineProvider>
  </StrictMode>,
);
