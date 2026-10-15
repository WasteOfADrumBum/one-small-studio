import { motion, useReducedMotion } from 'motion/react';
import { site } from '@/lib/site';
import { Console } from './Console';
import classes from './Hero.module.css';

const genreList = new Intl.ListFormat('en', { type: 'conjunction' }).format(
  site.genres.map((g) => g.toLowerCase()),
);

/** Section 1, "Soundcheck": who this is, then the console that plays the featured album. */
export function Hero() {
  const reduceMotion = useReducedMotion();
  const words = site.name.split(' ');

  return (
    <section id="top" className={classes.hero} aria-labelledby="hero-title">
      <div className={`oss-container ${classes.inner}`}>
        <header className={classes.intro}>
          <span className="label">
            Live since {site.playingLiveSince} · Recording Workshop {site.recordingWorkshopGrad}
          </span>
          <h1 id="hero-title" className={classes.title}>
            {words.map((word, i) => (
              <motion.span
                key={word}
                className={i === 1 ? classes.accent : undefined}
                initial={reduceMotion ? false : { opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {word}
              </motion.span>
            ))}
          </h1>
          <p className={classes.lede}>
            {site.tagline} Drummer, audio engineer, live sound tech and producer in {genreList}.
          </p>
        </header>

        <Console />
      </div>
    </section>
  );
}
