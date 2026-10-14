import { gear } from '@/content/gear';
import { SectionHeader } from './SectionHeader';
import { RackCabinet, RackFiller, RackUnit } from './Rack';
import classes from './Studio.module.css';

const heights = gear.map((group) => group.items.reduce((sum, item) => sum + item.size, 0));
const tallest = Math.max(...heights);

/** Section 3, "The Studio": the gear, racked in three cabinets standing side by side. */
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
              edge={i === 0 ? 'left' : i === gear.length - 1 ? 'right' : undefined}
            >
              {group.items.map((item) => (
                <RackUnit key={`${item.brand}-${item.model}`} item={item} />
              ))}
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
