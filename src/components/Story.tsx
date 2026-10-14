import { useCallback, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { useReducedMotion } from 'motion/react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { eras, lanes, timelineEnd, timelineStart, yearLabel, type Era } from '@/content/story';
import { SectionHeader } from './SectionHeader';
import { StudioMonitor } from './StudioMonitor';
import { Waveform } from './Waveform';
import { useDragScroll } from './useDragScroll';
import { useTimelineScroll } from './useTimelineScroll';
import classes from './Story.module.css';

const years = Array.from({ length: timelineEnd - timelineStart }, (_, i) => timelineStart + i);
const decades = Array.from(new Set(years.map((y) => Math.floor(y / 10) * 10))).map((d) => ({
  label: `${d}s`,
  from: Math.max(d, timelineStart),
  to: Math.min(d + 10, timelineEnd),
}));

/** Clips in time order: the order keyboard focus steps through and screen readers hear. */
const clips = [...eras].sort(
  (a, b) => a.start - b.start || lanes.indexOf(a.lane) - lanes.indexOf(b.lane),
);

/**
 * Stacks overlapping clips on a lane into extra rows, the way a DAW shows alternate playlists, and
 * works out where each lane starts.
 */
function layout() {
  const rowOf = new Map<Era, number>();
  const laneRows = lanes.map((lane) => {
    const ends: number[] = [];
    for (const era of clips.filter((e) => e.lane === lane)) {
      let row = ends.findIndex((end) => end <= era.start);
      if (row === -1) row = ends.push(0) - 1;
      ends[row] = era.end ?? timelineEnd;
      rowOf.set(era, row);
    }
    return Math.max(1, ends.length);
  });
  const laneTop = laneRows.map((_, i) => laneRows.slice(0, i).reduce((a, b) => a + b, 0));
  return { rowOf, laneRows, laneTop, totalRows: laneRows.reduce((a, b) => a + b, 0) };
}

const { rowOf, laneRows, laneTop, totalRows } = layout();

/** Years from the last event's start to the end of the timeline: the post-roll it needs. */
const tail = timelineEnd - clips[clips.length - 1].start;

const clipLabel = (era: Era) => `${era.title}, ${era.lane} track, ${yearLabel(era)}`;

/**
 * Section 2, "The Story": the timeline as an edit window on a studio monitor. The session scrolls
 * sideways inside the screen with fixed track headers; clips are selectable, and the desk unit
 * under the monitor shows the full story of the selected one.
 */
export function Story() {
  const [selected, setSelected] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);
  const clipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduceMotion = useReducedMotion();
  const drag = useDragScroll(viewport);
  const era = clips[selected];

  const playhead = useRef<HTMLSpanElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const eventEls = useCallback(() => clipRefs.current, []);
  const timeline = useTimelineScroll(viewport, {
    playhead,
    events: eventEls,
    ruler,
    startYear: timelineStart,
    reduceMotion: !!reduceMotion,
  });
  const playheadYear = Math.min(
    timelineEnd - 1,
    Math.max(timelineStart, Math.floor(timeline.year)),
  );

  // Earlier/Later move to the previous or next event and select it.
  const step = (direction: -1 | 1) => {
    const index = timeline.go(direction);
    if (index !== null) setSelected(index);
  };

  // Selection never scrolls the timeline by itself; keyboard focus brings a clip into view.
  const select = (index: number, focus = false) => {
    const next = Math.max(0, Math.min(clips.length - 1, index));
    setSelected(next);
    if (focus) clipRefs.current[next]?.focus();
  };

  const onClipKey = (event: KeyboardEvent, index: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (step) {
      event.preventDefault();
      select(index + step, true);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      select(event.key === 'Home' ? 0 : clips.length - 1, true);
    }
  };

  const sessionStyle = {
    '--years': years.length,
    '--rows': totalRows,
    '--sel-x': era.start - timelineStart,
    '--sel-w': (era.end ?? timelineEnd) - era.start,
  } as CSSProperties;

  return (
    <section id="story" className={classes.story} aria-labelledby="story-title">
      <div className="oss-container">
        <SectionHeader
          label="Track 02 · The story"
          id="story-title"
          title="Thirty years, one arrangement"
        >
          This is a look back, not a sales pitch. I don&apos;t tour or take gigs anymore, but this
          is what the road and the studio looked like.
        </SectionHeader>

        <StudioMonitor
          notes={
            <div className={classes.notes} aria-live="polite" aria-atomic="true">
              <div className={classes.notesHead}>
                <span className={classes.notesLabel}>Session notes</span>
                <span className={classes.notesLane} data-lane={era.lane}>
                  {era.lane} · clip {selected + 1} of {clips.length}
                </span>
              </div>
              <h3 className={classes.notesTitle}>{era.title}</h3>
              <p className={classes.notesYears}>{yearLabel(era)}</p>
              <p className={classes.notesBody}>{era.body}</p>
            </div>
          }
        >
          <div className={classes.window}>
            <div className={classes.titleBar} aria-hidden="true">
              <span className={classes.lights}>
                <i />
                <i />
                <i />
              </span>
              <span>Edit: The Story</span>
              <span className={classes.titleMeta}>
                {lanes.length} tracks · {clips.length} clips
              </span>
            </div>

            <div className={classes.toolbar}>
              <div className={classes.nav}>
                <button
                  type="button"
                  className={classes.navButton}
                  onClick={() => step(-1)}
                  disabled={!timeline.canEarlier}
                  aria-controls="story-timeline"
                >
                  <IconChevronLeft size={16} aria-hidden="true" />
                  Earlier
                </button>
                <button
                  type="button"
                  className={classes.navButton}
                  onClick={() => step(1)}
                  disabled={!timeline.canLater}
                  aria-controls="story-timeline"
                >
                  Later
                  <IconChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
              {/* The main clock: the year under the playhead, following every scroll. */}
              <div className={classes.counter} data-kind="position">
                <span className={classes.counterLabel}>Playhead</span>
                <span className={classes.counterValue}>{playheadYear}</span>
              </div>
              <div className={classes.counter} aria-hidden="true">
                <span className={classes.counterLabel}>Selection</span>
                <span className={classes.counterValue}>{yearLabel(era)}</span>
              </div>
              <div className={classes.modes} aria-hidden="true">
                <span>Grid · 1 year</span>
                <span>
                  View {Math.max(timelineStart, timeline.from)} to{' '}
                  {Math.min(timelineEnd - 1, timeline.to)}
                </span>
              </div>
            </div>

            <div className={classes.stage} style={{ '--tail': tail } as CSSProperties}>
              <div
                ref={viewport}
                id="story-timeline"
                className={classes.viewport}
                data-dragging={drag.dragging || undefined}
                {...drag.handlers}
              >
                <div className={classes.session} style={sessionStyle}>
                  {/* Ruler: decades over years. */}
                  <div className={classes.rulerRow} aria-hidden="true">
                    <div className={classes.corner}>
                      <span>Era</span>
                      <span>Year</span>
                    </div>
                    <div className={classes.ruler}>
                      <div className={classes.decades}>
                        {decades.map((d) => (
                          <span
                            key={d.label}
                            style={
                              {
                                '--x': d.from - timelineStart,
                                '--w': d.to - d.from,
                              } as CSSProperties
                            }
                          >
                            {d.label}
                          </span>
                        ))}
                      </div>
                      <div ref={ruler} className={classes.years}>
                        {years.map((y) => (
                          <span key={y} data-major={y % 5 === 0 || undefined}>
                            {y}
                          </span>
                        ))}
                      </div>
                      <span className={classes.selectionBand} />
                    </div>
                  </div>

                  {/* Tracks: fixed headers and the lanes behind the clips. */}
                  {lanes.map((lane, i) => {
                    const ongoing = eras.some((e) => e.lane === lane && e.end === null);
                    return (
                      <div
                        key={lane}
                        className={classes.trackRow}
                        data-lane={lane}
                        style={{ '--lane-rows': laneRows[i] } as CSSProperties}
                        aria-hidden="true"
                      >
                        <div className={classes.trackHead} data-track-head>
                          <span className={classes.trackChip} />
                          <span className={classes.trackNum}>{i + 1}</span>
                          <span className={classes.trackName}>{lane}</span>
                          <span className={classes.trackState} data-on={ongoing || undefined}>
                            <span className={classes.trackLed} />
                            {ongoing ? 'Ongoing' : 'Closed'}
                          </span>
                        </div>
                        <div className={classes.lane} />
                      </div>
                    );
                  })}

                  <div
                    className={classes.clips}
                    role="group"
                    aria-label="Timeline clips, earliest first"
                  >
                    {clips.map((c, i) => (
                      <button
                        key={c.title}
                        ref={(el) => {
                          clipRefs.current[i] = el;
                        }}
                        type="button"
                        className={classes.clip}
                        data-lane={c.lane}
                        aria-pressed={i === selected}
                        aria-label={clipLabel(c)}
                        title={c.title}
                        onClick={() => !drag.moved() && select(i)}
                        onKeyDown={(e) => onClipKey(e, i)}
                        style={
                          {
                            '--x': c.start - timelineStart,
                            '--w': (c.end ?? timelineEnd) - c.start,
                            '--r': laneTop[lanes.indexOf(c.lane)] + (rowOf.get(c) ?? 0),
                          } as CSSProperties
                        }
                      >
                        <span className={classes.clipName}>
                          <span className={classes.clipText}>
                            <span className={classes.clipTitle}>{c.title}</span>
                            <span className={classes.clipYears}>{yearLabel(c)}</span>
                          </span>
                        </span>
                        <Waveform seed={c.title} lane={c.lane} className={classes.wave} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <span ref={playhead} className={classes.playhead} aria-hidden="true" />
            </div>
          </div>
        </StudioMonitor>
      </div>
    </section>
  );
}
