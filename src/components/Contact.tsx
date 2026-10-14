import { useState, type FormEvent } from 'react';
import { Alert, Button, Select, SimpleGrid, Textarea, TextInput } from '@mantine/core';
import { IconCheck, IconSend } from '@tabler/icons-react';
import { contactReasons, contactSchema, type ContactInput } from '@/lib/contact';
import { Led } from './hardware/Led';
import { Screw } from './hardware/Screw';
import { SectionHeader } from './SectionHeader';
import classes from './Contact.module.css';

type Errors = Partial<Record<keyof ContactInput, string>>;
const empty: ContactInput = { name: '', email: '', reason: 'networking', message: '', website: '' };

/** Section 5, "Talkback": a way for other musicians and engineers to reach me. */
export function Contact() {
  const [values, setValues] = useState<ContactInput>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [failure, setFailure] = useState('');

  const set = <K extends keyof ContactInput>(key: K, value: ContactInput[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues)
        next[issue.path[0] as keyof ContactInput] ??= issue.message;
      return setErrors(next);
    }
    setErrors({});
    setState('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      if (res.ok) {
        setValues(empty);
        return setState('sent');
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setFailure(body.error ?? 'The message did not go through.');
    } catch {
      setFailure('The message did not go through. Check your connection and try again.');
    }
    setState('failed');
  };

  return (
    <section id="contact" className={classes.contact} aria-labelledby="contact-title">
      <div className={`oss-container ${classes.inner}`}>
        <SectionHeader label="Track 05 · Talkback" id="contact-title" title="Hit the talkback">
          Not for hire, but always up for talking shop. Musicians, engineers, old bandmates: say
          hello.
        </SectionHeader>

        <div className={classes.panel}>
          <Screw className={classes.tl} turn={15} />
          <Screw className={classes.tr} turn={-30} />
          <Screw className={classes.bl} turn={50} />
          <Screw className={classes.br} turn={-10} />
          <div className={classes.panelHead}>
            <span className={classes.tbLamp}>
              <Led
                on={state !== 'idle' && state !== 'failed'}
                color={state === 'sent' ? 'green' : 'amber'}
                blink={state === 'sending'}
              />
              <span className="label">
                Talkback ·{' '}
                {state === 'sending'
                  ? 'Sending'
                  : state === 'sent'
                    ? 'Received'
                    : state === 'failed'
                      ? 'Not sent'
                      : 'Ready'}
              </span>
            </span>
            <span className={classes.grille} aria-hidden="true" />
          </div>

          {state === 'sent' ? (
            <Alert color="crimson" icon={<IconCheck />} title="Message received">
              Thanks for reaching out. I&apos;ll get back to you at the email you gave.
            </Alert>
          ) : (
            <form onSubmit={onSubmit} noValidate className={classes.form}>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput
                  label="Name"
                  value={values.name}
                  onChange={(e) => set('name', e.currentTarget.value)}
                  error={errors.name}
                  autoComplete="name"
                  required
                />
                <TextInput
                  label="Email"
                  type="email"
                  value={values.email}
                  onChange={(e) => set('email', e.currentTarget.value)}
                  error={errors.email}
                  autoComplete="email"
                  required
                />
              </SimpleGrid>
              <Select
                label="What's it about?"
                data={contactReasons.map((r) => ({ ...r }))}
                value={values.reason}
                onChange={(v) => v && set('reason', v as ContactInput['reason'])}
                allowDeselect={false}
              />
              <Textarea
                label="Message"
                value={values.message}
                onChange={(e) => set('message', e.currentTarget.value)}
                error={errors.message}
                minRows={5}
                autosize
                required
              />
              {/* Honeypot for bots; people never see it. */}
              <input
                className={classes.trap}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                name="website"
                value={values.website}
                onChange={(e) => set('website', e.currentTarget.value)}
              />
              {state === 'failed' && (
                <Alert color="red" variant="light">
                  {failure}
                </Alert>
              )}
              <Button
                type="submit"
                loading={state === 'sending'}
                rightSection={<IconSend size={16} />}
                className={classes.send}
              >
                Send it
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
