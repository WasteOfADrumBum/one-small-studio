import { PowerProvider } from '@/lib/power';
import { Hero } from '@/components/Hero';
import { Story } from '@/components/Story';
import { Outro } from '@/components/Outro';

export function App() {
  return (
    <PowerProvider>
      <main>
        <Hero />
        <Story />
      </main>
      <Outro />
    </PowerProvider>
  );
}
