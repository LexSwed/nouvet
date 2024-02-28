import { createSignal, Match, Show, Switch } from 'solid-js';
import { Motion, Presence } from 'solid-motionone';
import { Button, Icon, Popover, Text } from '@nou/ui';

import { createTranslator } from '~/server/i18n';

const FamilyInviteDialog = (props: { id: string }) => {
  const t = createTranslator('app');
  const tCommon = createTranslator('common');
  // TODO: scroll to a screen with generated QR code, or scan it

  const [step, setStep] = createSignal(0);

  return (
    <Popover
      id={props.id}
      placement="center"
      role="dialog"
      class="to-primary/12 from-surface flex w-[94svw] max-w-[420px] flex-col gap-6 bg-gradient-to-b p-6"
    >
      <header class="-m-4 flex flex-row items-center justify-between gap-2">
        <Show when={step() !== 0}>
          <Button
            variant="ghost"
            icon
            label={tCommon('back')}
            onClick={() => setStep((current) => current - 1)}
          >
            <Icon use="chevron-left" />
          </Button>
          <Text>
            <Switch>
              <Match when={step() === 1}>{t('family-invite.step-1')}</Match>
              <Match when={step() === 2}>{t('family-invite.step-2')}</Match>
            </Switch>
          </Text>
        </Show>
        <Button
          variant="ghost"
          popoverTarget={props.id}
          popoverTargetAction="hide"
          icon
          label={tCommon('close-dialog')}
          class="ms-auto"
        >
          <Icon use="x" />
        </Button>
      </header>
      <Presence exitBeforeEnter initial={false}>
        <Switch>
          <Match when={step() === 0}>
            <Motion.div
              class="flex flex-col gap-6"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
            >
              <Text with="headline-2" as="h2">
                {t('family-invite.headline')}
              </Text>
              <Text as="p">{t('family-invite.subheadline')}</Text>
              {/* TODO: insert screenshots of future features:
      - shared reminders and actions
      - shared notes
      - access to doctor visits and prescriptions */}
              <ul class="overflow-snap -mx-6 flex scroll-px-6 flex-row gap-4 px-6 [&>*]:snap-center">
                <li class="bg-tertiary/15 h-28 w-[95%] rounded-2xl" />
                <li class="bg-tertiary/15 h-28 w-[95%] rounded-2xl" />
                <li class="bg-tertiary/15 h-28 w-[95%] rounded-2xl" />
              </ul>
            </Motion.div>
          </Match>
          <Match when={step() === 0}>
            <Motion.div
              class="flex  flex-col gap-6"
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Text with="headline-2" as="header">
                {t('family-invite.headline')}
              </Text>
              <Text as="p">{t('family-invite.subheadline')}</Text>
              {/* TODO: insert screenshots of future features:
      - shared reminders and actions
      - shared notes
      - access to doctor visits and prescriptions */}
              <ul class="overflow-snap -mx-6 flex scroll-px-6 flex-row gap-4 px-6 [&>*]:snap-center">
                <li class="bg-tertiary/15 h-28 w-[95%] rounded-2xl" />
                <li class="bg-tertiary/15 h-28 w-[95%] rounded-2xl" />
                <li class="bg-tertiary/15 h-28 w-[95%] rounded-2xl" />
              </ul>
            </Motion.div>
          </Match>
          <Match when={step() === 1}>
            <Motion.div
              class="flex  flex-col gap-6"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Text with="headline-2" as="header">
                {t('family-invite.headline')}
              </Text>
              <Text as="p">{t('family-invite.subheadline')}</Text>
              {/* TODO: insert screenshots of future features:
      - shared reminders and actions
      - shared notes
      - access to doctor visits and prescriptions */}
              <ul class="overflow-snap -mx-6 flex scroll-px-6 flex-row gap-4 px-6 [&>*]:snap-center">
                <li class="bg-tertiary/15 h-28 w-[95%] rounded-2xl" />
                <li class="bg-tertiary/15 h-28 w-[95%] rounded-2xl" />
                <li class="bg-tertiary/15 h-28 w-[95%] rounded-2xl" />
              </ul>
            </Motion.div>
          </Match>
        </Switch>
      </Presence>
      <div class="flex flex-col gap-2">
        <Button onClick={() => setStep(1)}>{t('family-invite.cta')}</Button>
        <Presence>
          <Show when={step() === 0}>
            <Motion.div class="self-center" exit={{ y: 100, opacity: 0 }}>
              <Button variant="link">{t('family-invite.join')}</Button>
            </Motion.div>
          </Show>
        </Presence>
      </div>
    </Popover>
  );
};

export default FamilyInviteDialog;
