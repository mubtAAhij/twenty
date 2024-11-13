import { ColorSchemePicker, H2Title, Section } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useI18n } from '@quetzallabs/i18n';
import { DateTimeSettings } from '~/pages/settings/profile/appearance/components/DateTimeSettings';

export const SettingsAppearance = () => {
  const { t } = useI18n();
  const { colorScheme, setColorScheme } = useColorScheme();
  
  return (
    <SubMenuTopBarContainer
      title={t('Experience')}
      links={[
        {
          children: t('User'),
          href: getSettingsPagePath(SettingsPath.ProfilePage),
        },
        {
          children: t('Experience'),
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={t('Appearance')} />
          <ColorSchemePicker value={colorScheme} onChange={setColorScheme} />
        </Section>
        <Section>
          <H2Title
            title={t('Date and time')}
            description={t('Configure how dates are displayed across the app')}
          />
          <DateTimeSettings />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
