import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { H2Title, Section } from 'twenty-ui';

import { useGetDatabaseConnections } from '@/databases/hooks/useGetDatabaseConnections';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationPreview } from '@/settings/integrations/components/SettingsIntegrationPreview';
import { SettingsIntegrationDatabaseConnectionsListCard } from '@/settings/integrations/database-connection/components/SettingsIntegrationDatabaseConnectionsListCard';
import { useIsSettingsIntegrationEnabled } from '@/settings/integrations/hooks/useIsSettingsIntegrationEnabled';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useI18n } from '@quetzallabs/i18n';

export const SettingsIntegrationDatabase = () => {
  const { t } = useI18n();
  const { databaseKey = '' } = useParams();
  const navigate = useNavigate();

  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === databaseKey,
  );

  const isIntegrationEnabled = useIsSettingsIntegrationEnabled(databaseKey);

  const isIntegrationAvailable = !!integration && isIntegrationEnabled;

  useEffect(() => {
    if (!isIntegrationAvailable) {
      navigate(AppPath.NotFound);
    }
  }, [integration, databaseKey, navigate, isIntegrationAvailable]);

  const { connections } = useGetDatabaseConnections({
    databaseKey,
    skip: !isIntegrationAvailable,
  });

  if (!isIntegrationAvailable) return null;
  
  return (
    <SubMenuTopBarContainer
      title={integration.text}
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
          children: integration.text,
        },
      ]}
    >
      <SettingsPageContainer>
        <SettingsIntegrationPreview
          integrationLogoUrl={integration.from.image}
        />
        <Section>
          <H2Title
            title={t('{dynamic1} database', {
              dynamic1: integration.text,
            })}
            description={t('Connect or access your {dynamic1} data', {
              dynamic1: integration.text,
            })}
          />
          <SettingsIntegrationDatabaseConnectionsListCard
            integration={integration}
            connections={connections}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
