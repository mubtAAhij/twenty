import { H2Title, IconLock, Section, Tag } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsReadDocumentationButton } from '@/settings/developers/components/SettingsReadDocumentationButton';
import { SettingsSSOIdentitiesProvidersListCard } from '@/settings/security/components/SettingsSSOIdentitiesProvidersListCard';
import { SettingsSecurityOptionsList } from '@/settings/security/components/SettingsSecurityOptionsList';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useI18n } from '@quetzallabs/i18n';

export const SettingsSecurity = () => {
  const { t } = useI18n();
  return (
    <SubMenuTopBarContainer
      title={t('Security')}
      actionButton={<SettingsReadDocumentationButton />}
      links={[
        {
          children: t('Workspace'),
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        {
          children: t('Security'),
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t('SSO')}
            description={t('Configure an SSO connection')}
            addornment={
              <Tag
                text={t('Enterprise')}
                color={'transparent'}
                Icon={IconLock}
                variant={'border'}
              />
            }
          />
          <SettingsSSOIdentitiesProvidersListCard />
        </Section>
        <Section>
          <H2Title
            title={t('Other')}
            description={t('Customize your workspace security')}
          />
          <SettingsSecurityOptionsList />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
