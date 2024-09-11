import { useCreateOneRelationMetadataItem } from '@/object-metadata/hooks/useCreateOneRelationMetadataItem';
import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsDataModelNewFieldBreadcrumbDropDown } from '@/settings/data-model/components/SettingsDataModelNewFieldBreadcrumbDropDown';
import { SettingsDataModelFieldConfigurationForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldConfigurationForm';
import { SettingsDataModelFieldTypeSelect } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldTypeSelect';
import { settingsFieldFormSchema } from '@/settings/data-model/fields/forms/validation-schemas/settingsFieldFormSchema';
import { SettingsSupportedFieldType } from '@/settings/data-model/types/SettingsSupportedFieldType';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';
import { useApolloClient } from '@apollo/client';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import pick from 'lodash.pick';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { H1Title, H1TitleFontColor, IconHierarchy2 } from 'twenty-ui';
import { z } from 'zod';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export type SettingsDataModelNewFieldFormValues = z.infer<
  ReturnType<typeof settingsFieldFormSchema>
>;

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

export const SettingsObjectNewFieldStep2 = () => {
  const navigate = useNavigate();
  const { objectSlug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const fieldType = searchParams.get('fieldType') as SettingsSupportedFieldType;
  const { enqueueSnackBar } = useSnackBar();

  const [isConfigureStep, setIsConfigureStep] = useState(false);
  const { findActiveObjectMetadataItemBySlug } =
    useFilteredObjectMetadataItems();

  const activeObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug);
  const { createMetadataField } = useFieldMetadataItem();

  const formConfig = useForm<SettingsDataModelNewFieldFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(
      settingsFieldFormSchema(
        activeObjectMetadataItem?.fields.map((value) => value.name),
      ),
    ),
  });

  useEffect(() => {
    if (!activeObjectMetadataItem) {
      navigate(AppPath.NotFound);
    }
  }, [activeObjectMetadataItem, navigate]);

  const [, setObjectViews] = useState<View[]>([]);
  const [, setRelationObjectViews] = useState<View[]>([]);

  useFindManyRecords<View>({
    objectNameSingular: CoreObjectNameSingular.View,
    filter: {
      type: { eq: ViewType.Table },
      objectMetadataId: { eq: activeObjectMetadataItem?.id },
    },
    onCompleted: async (views) => {
      if (isUndefinedOrNull(views)) return;

      setObjectViews(views);
    },
  });

  const relationObjectMetadataId = formConfig.watch(
    'relation.objectMetadataId',
  );

  useFindManyRecords<View>({
    objectNameSingular: CoreObjectNameSingular.View,
    skip: !relationObjectMetadataId,
    filter: {
      type: { eq: ViewType.Table },
      objectMetadataId: { eq: relationObjectMetadataId },
    },
    onCompleted: async (views) => {
      if (isUndefinedOrNull(views)) return;

      setRelationObjectViews(views);
    },
  });

  const { createOneRelationMetadataItem: createOneRelationMetadata } =
    useCreateOneRelationMetadataItem();

  const apolloClient = useApolloClient();

  if (!activeObjectMetadataItem) return null;

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const handleSave = async (
    formValues: SettingsDataModelNewFieldFormValues,
  ) => {
    try {
      if (
        formValues.type === FieldMetadataType.Relation &&
        'relation' in formValues
      ) {
        const { relation: relationFormValues, ...fieldFormValues } = formValues;

        await createOneRelationMetadata({
          relationType: relationFormValues.type,
          field: pick(fieldFormValues, ['icon', 'label', 'description']),
          objectMetadataId: activeObjectMetadataItem.id,
          connect: {
            field: {
              icon: relationFormValues.field.icon,
              label: relationFormValues.field.label,
            },
            objectMetadataId: relationFormValues.objectMetadataId,
          },
        });
      } else {
        await createMetadataField({
          ...formValues,
          objectMetadataId: activeObjectMetadataItem.id,
        });
      }

      navigate(`/settings/objects/${objectSlug}`);

      // TODO: fix optimistic update logic
      // Forcing a refetch for now but it's not ideal
      await apolloClient.refetchQueries({
        include: ['FindManyViews', 'CombinedFindManyRecords'],
      });
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const excludedFieldTypes: SettingsSupportedFieldType[] = (
    [
      FieldMetadataType.Link,
      FieldMetadataType.Numeric,
      FieldMetadataType.RichText,
      FieldMetadataType.Actor,
      FieldMetadataType.Email,
    ] as const
  ).filter(isDefined);

  return (
    <RecordFieldValueSelectorContextProvider>
      <FormProvider // eslint-disable-next-line react/jsx-props-no-spreading
        {...formConfig}
      >
        <SubMenuTopBarContainer
          Icon={IconHierarchy2}
          title={
            <Breadcrumb
              links={[
                {
                  children: 'Objects',
                  href: '/settings/objects',
                  styles: { minWidth: 'max-content' },
                },
                {
                  children: activeObjectMetadataItem.labelPlural,
                  href: `/settings/objects/${objectSlug}`,
                  styles: { maxWidth: '50%' },
                },
                {
                  children: (
                    <SettingsDataModelNewFieldBreadcrumbDropDown
                      isConfigureStep={isConfigureStep}
                      onBreadcrumbClick={setIsConfigureStep}
                    />
                  ),
                },
              ]}
            />
          }
          actionButton={
            !activeObjectMetadataItem.isRemote && isConfigureStep ? (
              <SaveAndCancelButtons
                isSaveDisabled={!canSave}
                isCancelDisabled={isSubmitting}
                onCancel={() => {
                  setIsConfigureStep(false);
                }}
                onSave={formConfig.handleSubmit(handleSave)}
              />
            ) : null
          }
        >
          <SettingsPageContainer>
            <StyledH1Title
              title={
                !isConfigureStep
                  ? '1. Select a field type'
                  : '2. Configure field'
              }
              fontColor={H1TitleFontColor.Primary}
            />

            {!isConfigureStep ? (
              <SettingsDataModelFieldTypeSelect
                excludedFieldTypes={excludedFieldTypes}
                fieldMetadataItem={{
                  type: fieldType,
                }}
                onFieldTypeSelect={() => setIsConfigureStep(true)}
              />
            ) : (
              <SettingsDataModelFieldConfigurationForm
                formConfig={formConfig}
                activeObjectMetadataItem={activeObjectMetadataItem}
                setIsConfigureStep={setIsConfigureStep}
              />
            )}
          </SettingsPageContainer>
        </SubMenuTopBarContainer>
      </FormProvider>
    </RecordFieldValueSelectorContextProvider>
  );
};
