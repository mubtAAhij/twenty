import { GithubVersionLink, H2Title, Section } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { DeleteWorkspace } from '@/settings/profile/components/DeleteWorkspace';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { NameField } from '@/settings/workspace/components/NameField';
import { ToggleImpersonate } from '@/settings/workspace/components/ToggleImpersonate';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useI18n } from '@quetzallabs/i18n';
import packageJson from '../../../package.json';

export const SettingsWorkspace = () => {
  const { t } = useI18n();
  return (
    <SubMenuTopBarContainer
      title={t('General')}
      links={[
        {
          children: t('Workspace'),
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        {
          children: t('General'),
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={t('Picture')} />
          <WorkspaceLogoUploader />
        </Section>
        <Section>
          <H2Title
            title={t('Name')}
            description={t('Name of your workspace')}
          />
          <NameField />
        </Section>
        <Section>
          <H2Title
            title={t('Support')}
            addornment={<ToggleImpersonate />}
            description={t(
              'Grant Twenty support temporary access to your workspace so we can troubleshoot problems or recover content on your behalf. You can revoke access at any time.',
            )}
          />
        </Section>
        <Section>
          <DeleteWorkspace />
        </Section>
        <Section>
          <GithubVersionLink version={packageJson.version} />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
