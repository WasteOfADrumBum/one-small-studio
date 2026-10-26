import { PowerProvider } from '@/lib/power';
import { PlayerProvider } from '@/lib/player';
import { TransportBar } from '@/components/TransportBar';
import { Hero } from '@/components/Hero';
import { Story } from '@/components/Story';
import { Studio } from '@/components/Studio';
import { Catalog } from '@/components/Catalog';
import { Contact } from '@/components/Contact';
import { Outro } from '@/components/Outro';

export function App() {
  return (
    <PowerProvider>
      <PlayerProvider>
        <a href="#story" className="skip-link">
          Skip to the story
        </a>
        <TransportBar />
        <main>
          <Hero />
          <Story />
          <Studio />
          <Catalog />
          <Contact />
        </main>
        <Outro />
      </PlayerProvider>
    </PowerProvider>
  );
}
