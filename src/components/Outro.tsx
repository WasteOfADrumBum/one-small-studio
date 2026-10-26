import { Anchor, Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { useMotionPause } from '@/lib/motion';
import { links, site } from '@/lib/site';
import classes from './Outro.module.css';

/** Section 6: the lights go down. */
export function Outro() {
  const live = links.filter((link) => link.href);
  const [motionPaused, setMotionPaused] = useMotionPause();
  return (
    <footer className={classes.outro}>
      <Container size="lg">
        <Stack gap="sm" align="center" ta="center">
          <span className="label">Master out</span>
          <Title order={2} className={classes.heading}>
            Not booking. Still listening.
          </Title>
          <Text c="dimmed" maw={560}>
            {site.name} is a hobby showcase. There&apos;s nothing for sale here, just the work.
          </Text>
          {live.length > 0 && (
            <Group gap="lg" mt="md">
              {live.map((link) => (
                <Anchor key={link.label} href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </Anchor>
              ))}
            </Group>
          )}
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            mt="md"
            onClick={() => setMotionPaused(!motionPaused)}
            aria-pressed={motionPaused}
            leftSection={
              motionPaused ? (
                <IconPlayerPlay size={14} aria-hidden="true" />
              ) : (
                <IconPlayerPause size={14} aria-hidden="true" />
              )
            }
          >
            {motionPaused ? 'Play page animations' : 'Pause page animations'}
          </Button>
          <Text size="xs" c="dimmed" mt="md">
            © {new Date().getFullYear()} {site.owner}
          </Text>
        </Stack>
      </Container>
    </footer>
  );
}
