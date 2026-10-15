import classes from './Hardware.module.css';

type LedProps = {
  on: boolean;
  color?: 'amber' | 'green' | 'red';
  blink?: boolean;
  className?: string;
};

/** An indicator lamp. Its state is always repeated in visible text nearby, so it stays decorative. */
export function Led({ on, color = 'amber', blink = false, className }: LedProps) {
  return (
    <span
      className={className ? `${classes.led} ${className}` : classes.led}
      data-color={color}
      data-on={on || undefined}
      data-blink={(on && blink) || undefined}
      aria-hidden="true"
    />
  );
}
