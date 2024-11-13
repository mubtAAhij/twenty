import { SettingsServerlessFunctionsTable } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsTable';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useI18n } from "@quetzallabs/i18n";
import { Button, IconPlus, Section, UndecoratedLink } from 'twenty-ui';
export const SettingsServerlessFunctions = () => {
    const { t } = useI18n();
  return <SubMenuTopBarContainer title={t("Functions")} actionButton={<UndecoratedLink to={getSettingsPagePath(SettingsPath.NewServerlessFunction)}>
          <Button Icon={IconPlus} title={t("New Function")} accent="blue" size="small" />
        </UndecoratedLink>} links={[{
    children: t("Workspace"),
    href: getSettingsPagePath(SettingsPath.Workspace)
  }, {
    children: t("Functions")
  }]}>
      <Section>
        <SettingsServerlessFunctionsTable />
      </Section>
    </SubMenuTopBarContainer>;
};