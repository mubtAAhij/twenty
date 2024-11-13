import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationDatabaseConnectionShowContainer } from '@/settings/integrations/database-connection/components/SettingsIntegrationDatabaseConnectionShowContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useI18n } from '@quetzallabs/i18n';

export const SettingsIntegrationShowDatabaseConnection = () => {
  const { t } = useI18n();
  return (
    <SubMenuTopBarContainer
      title={t('Database Connection')}
      links={[
        {
          children: t('Workspace'),
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        {
          children: t('Integrations'),
          href: getSettingsPagePath(SettingsPath.Integrations),
        },
        {
          children: t('Database Connection'),
        },
      ]}
    >
      <SettingsPageContainer>
        <SettingsIntegrationDatabaseConnectionShowContainer />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
