import { useRef } from 'react';
import { Container, Stack, Text, UnstyledButton } from '@mantine/core';
import { motion, useReducedMotion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { site } from '@/lib/site';
import { usePower } from '@/lib/power';
import { Knob } from './Knob';
import { LedMeter } from './LedMeter';
import classes from './Hero.module.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Where each channel's gain settles when the console powers on, in degrees from twelve o'clock.
const genreList = new Intl.ListFormat('en', { type: 'conjunction' }).format(
  site.genres.map((g) => g.toLowerCase()),
);

const CHANNELS = [
  { label: 'Drums', settle: 95, speed: 0.9 },
  { label: 'Engineering', settle: 20, speed: 1.4 },
  { label: 'Live sound', settle: 60, speed: 1.1 },
  { label: 'Production', settle: -10, speed: 1.6 },
];

/** Section 1, "Soundcheck": the console that wakes up when the visitor hits Power. */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const { powered, toggle } = usePower();
  const reduceMotion = useReducedMotion();
  const words = site.name.split(' ');

  // Power sweep: caps swing up past their mark and settle, or fall back to zero when switched off.
  useGSAP(
    () => {
      const caps = gsap.utils.toArray<SVGGElement>('[data-knob-cap]');
      caps.forEach((cap, i) => {
        gsap.to(cap, {
          svgOrigin: '50 50',
          rotation: powered ? CHANNELS[i].settle : -135,
          duration: reduceMotion ? 0 : powered ? 1.4 : 0.6,
          delay: powered && !reduceMotion ? i * 0.12 : 0,
          ease: powered ? 'elastic.out(1, 0.55)' : 'power2.in',
        });
      });
    },
    { scope: root, dependencies: [powered, reduceMotion] },
  );

  // Scroll: every knob turns a little further as the hero leaves the screen.
  useGSAP(
    () => {
      if (reduceMotion) return;
      gsap.to('[data-knob-scroll]', {
        svgOrigin: '50 50',
        rotation: (i: number) => (i % 2 ? -50 : 50),
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    },
    { scope: root, dependencies: [reduceMotion] },
  );

  return (
    <section ref={root} className={classes.hero} aria-labelledby="hero-title">
      <Container size="lg" className={classes.inner}>
        <Stack gap="xs" align="center" ta="center">
          <span className="label">
            Live since {site.playingLiveSince} · Recording Workshop {site.recordingWorkshopGrad}
          </span>
          <h1 id="hero-title" className={classes.title}>
            {words.map((word, i) => (
              <motion.span
                key={word}
                className={i === 1 ? classes.accent : undefined}
                initial={reduceMotion ? false : { opacity: 0, y: 40, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {word}
              </motion.span>
            ))}
          </h1>
          <Text size="lg" c="dimmed" maw={560}>
            {site.tagline} Drummer, audio engineer, live sound tech and producer in {genreList}.
          </Text>
        </Stack>

        <div className={classes.console} data-powered={powered || undefined}>
          {CHANNELS.map((channel) => (
            <div key={channel.label} className={classes.strip}>
              <Knob label="Gain" />
              <LedMeter active={powered} speed={channel.speed} />
              <span className={classes.channelName}>{channel.label}</span>
            </div>
          ))}

          <div className={classes.master}>
            <UnstyledButton
              className={classes.power}
              onClick={toggle}
              aria-pressed={powered}
              aria-label={powered ? 'Power off the console' : 'Power on the console'}
            >
              <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                <path d="M12 3v9" />
                <path d="M6.3 7.2a8 8 0 1 0 11.4 0" />
              </svg>
            </UnstyledButton>
            <span className="label">{powered ? 'On air' : 'Power'}</span>
          </div>
        </div>

        <Text className={classes.hint} size="sm" c="dimmed" ta="center">
          {powered
            ? 'The console is live. Scroll down for the story.'
            : 'Hit power to bring the board up. Nothing plays until you do.'}
        </Text>
      </Container>
    </section>
  );
}
