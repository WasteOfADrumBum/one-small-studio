import { gear, type GearItem } from '@/content/gear';
import { SectionHeader } from './SectionHeader';
import { AvatarCab } from './AvatarCab';
import { HalfRackRow, RackCabinet, RackFiller, RackUnit } from './Rack';
import classes from './Studio.module.css';

/** A rack's rows: a full-width unit, or up to two half-rack units side by side. */
function rows(items: GearItem[]) {
  const out: GearItem[][] = [];
  for (const item of items) {
    const last = out[out.length - 1];
    if (item.half && last?.length === 1 && last[0].half) last.push(item);
    else out.push([item]);
  }
  return out;
}

const racks = gear.map((group) => rows(group.items));
const heights = racks.map((r) =>
  r.reduce((sum, row) => sum + Math.max(...row.map((i) => i.size)), 0),
);
const tallest = Math.max(...heights);

/** Section 3, "The Studio": the gear, racked in two cabinets standing side by side. */
export function Studio() {
  return (
    <section id="studio" className={classes.studio} aria-labelledby="studio-title">
      <div className="oss-container">
        <SectionHeader label="Track 03 · The studio" id="studio-title" title="What's in the rack">
          The gear I trust, from the drum riser to the DAW.
        </SectionHeader>

        <div className={classes.row}>
          {gear.map((group, i) => (
            <RackCabinet
              key={group.name}
              title={group.name}
              power={group.power}
              side={i === 0 ? 'right' : i === gear.length - 1 ? 'left' : undefined}
              behind={
                group.items.some((item) => item.kind === 'speaker-cab') && (
                  <>
                    <AvatarCab sideways />
                    <AvatarCab />
                  </>
                )
              }
            >
              {racks[i].map((row) => {
                const key = row.map((item) => `${item.brand}-${item.model}`).join('+');
                return row[0].half ? (
                  <HalfRackRow key={key} items={row} />
                ) : (
                  <RackUnit key={key} item={row[0]} />
                );
              })}
              {/* Spare spaces get vent and blank panels, as a real rack would. */}
              {Array.from({ length: tallest - heights[i] }, (_, n) => (
                <RackFiller key={n} kind={n % 2 ? 'blank' : 'vent'} />
              ))}
            </RackCabinet>
          ))}
        </div>
      </div>
    </section>
  );
}
