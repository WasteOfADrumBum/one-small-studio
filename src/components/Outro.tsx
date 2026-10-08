import { Anchor, Container, Group, Stack, Text, Title } from '@mantine/core';
import { links, site } from '@/lib/site';
import classes from './Outro.module.css';

/** Section 6: the lights go down. */
export function Outro() {
  const live = links.filter((link) => link.href);
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
          <Text size="xs" c="dimmed" mt="xl">
            © {new Date().getFullYear()} {site.owner}
          </Text>
        </Stack>
      </Container>
    </footer>
  );
}
