import { useRef } from 'react';
import { Container, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { gear } from '@/content/gear';
import classes from './Studio.module.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Section 3, "The Studio": the gear, racked up. Units slide into the rails as they scroll in. */
export function Studio() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set('[data-unit]', { x: -60, opacity: 0 });
        ScrollTrigger.batch('[data-unit]', {
          start: 'top 88%',
          once: true,
          onEnter: (units) =>
            gsap.to(units, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08 }),
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="studio" className={classes.studio} aria-labelledby="studio-title">
      <Container size="lg">
        <Stack gap={4} mb="xl">
          <span className="label">Track 03 · The studio</span>
          <Title id="studio-title" order={2} className={classes.heading}>
            What&apos;s in the rack
          </Title>
          <Text c="dimmed" maw={620}>
            The gear I trust, from the drum riser to the DAW.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
          {gear.map((group) => (
            <div key={group.name} className={classes.rack}>
              <div className={classes.rackHead}>
                <span className="label">{group.name}</span>
              </div>
              {group.items.map((item) => (
                <article key={`${item.brand}-${item.model}`} className={classes.unit} data-unit>
                  <span className={classes.screw} aria-hidden="true" />
                  <div className={classes.unitBody}>
                    <div className={classes.unitTitle}>
                      <strong>{item.brand}</strong>
                      <span>{item.model}</span>
                    </div>
                    <p>{item.note}</p>
                  </div>
                  <span className={classes.led} aria-hidden="true" />
                  <span className={classes.screw} aria-hidden="true" />
                </article>
              ))}
            </div>
          ))}
        </SimpleGrid>
      </Container>
    </section>
  );
}
