import { SettingsAccountsCalendarChannelsContainer } from '@/settings/accounts/components/SettingsAccountsCalendarChannelsContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useI18n } from '@quetzallabs/i18n';
import { Section } from 'twenty-ui';

export const SettingsAccountsCalendars = () => {
  const { t } = useI18n();
  return (
    <SubMenuTopBarContainer
      title={t('Calendars')}
      links={[
        {
          children: t('User'),
          href: getSettingsPagePath(SettingsPath.ProfilePage),
        },
        {
          children: t('Accounts'),
          href: getSettingsPagePath(SettingsPath.Accounts),
        },
        {
          children: t('Calendars'),
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <SettingsAccountsCalendarChannelsContainer />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
