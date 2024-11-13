import { ReactFlowProvider } from 'reactflow';

import { SettingsDataModelOverview } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverview';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useI18n } from '@quetzallabs/i18n';

export const SettingsObjectOverview = () => {
  const { t } = useI18n();
  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: t('Workspace'),
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        {
          children: t('Objects'),
          href: '/settings/objects',
        },
        {
          children: t('Overview'),
        },
      ]}
    >
      <ReactFlowProvider>
        <SettingsDataModelOverview />
      </ReactFlowProvider>
    </SubMenuTopBarContainer>
  );
};
