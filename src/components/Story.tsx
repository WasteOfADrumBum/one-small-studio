import { useRef, useState, type CSSProperties } from 'react';
import { Container, Stack, Text, Title } from '@mantine/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { eras, lanes, timelineEnd, timelineStart, yearLabel } from '@/content/story';
import classes from './Story.module.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const YEAR_PX = 150;
const PLAYHEAD = 0.3; // fraction of the viewport width where the playhead stands
const years = Array.from({ length: timelineEnd - timelineStart }, (_, i) => timelineStart + i);
const trackWidth = years.length * YEAR_PX;

/**
 * Section 2, "The Story": the timeline as a DAW arrangement. On wide screens the section pins and the
 * lanes scroll sideways past a fixed playhead; on phones and with reduced motion it is a plain list.
 */
export function Story() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [year, setYear] = useState(timelineStart);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 62em) and (prefers-reduced-motion: no-preference)', () => {
        const el = track.current!;
        const viewport = el.parentElement!;
        // Scroll until the last year sits under the playhead.
        const distance = () => trackWidth - viewport.clientWidth * PLAYHEAD;
        gsap.fromTo(
          el,
          { x: () => viewport.clientWidth * PLAYHEAD },
          {
            x: () => viewport.clientWidth * PLAYHEAD - distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              start: 'top top',
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.6,
              invalidateOnRefresh: true,
              onUpdate: (self) =>
                setYear(Math.floor(timelineStart + (self.progress * distance()) / YEAR_PX)),
            },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="story" className={classes.story} aria-labelledby="story-title">
      <Container size="lg">
        <Stack gap={4} mb="xl">
          <span className="label">Track 02 · The story</span>
          <Title id="story-title" order={2} className={classes.heading}>
            Thirty years, one arrangement
          </Title>
          <Text c="dimmed" maw={620}>
            This is a look back, not a sales pitch. I don&apos;t tour or take gigs anymore, but this
            is what the road and the studio looked like.
          </Text>
        </Stack>
      </Container>

      <div className={classes.arrangement} aria-hidden="true">
        <div className={classes.counter}>
          <span className="label">Bar</span>
          <span className={classes.counterValue}>{Math.min(year, timelineEnd - 1)}</span>
        </div>
        <div className={classes.lanes}>
          {lanes.map((lane) => (
            <div key={lane} className={classes.laneName}>
              {lane}
            </div>
          ))}
        </div>
        <div className={classes.viewport}>
          <div ref={track} className={classes.track} style={{ width: trackWidth }}>
            <div className={classes.ruler}>
              {years.map((y) => (
                <span key={y} className={classes.bar} style={{ width: YEAR_PX }}>
                  {y % 5 === 0 || y === timelineStart ? y : ''}
                </span>
              ))}
            </div>
            {eras.map((era) => (
              <article
                key={era.title}
                className={classes.region}
                data-lane={era.lane}
                style={
                  {
                    left: (era.start - timelineStart) * YEAR_PX,
                    width: ((era.end ?? timelineEnd) - era.start) * YEAR_PX - 4,
                    '--row': lanes.indexOf(era.lane),
                  } as CSSProperties
                }
              >
                <strong>{era.title}</strong>
                <span className={classes.regionYears}>{yearLabel(era)}</span>
                <p>{era.body}</p>
              </article>
            ))}
          </div>
          <div className={classes.playhead} style={{ left: `${PLAYHEAD * 100}%` }} />
        </div>
      </div>

      <Container size="lg">
        <ol className={classes.list}>
          {eras.map((era) => (
            <li key={era.title} data-lane={era.lane}>
              <span className="label">
                {era.lane} · {yearLabel(era)}
              </span>
              <Title order={3}>{era.title}</Title>
              <Text c="dimmed">{era.body}</Text>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
