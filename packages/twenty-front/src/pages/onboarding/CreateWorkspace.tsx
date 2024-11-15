import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { H2Title, Loader, MainButton } from 'twenty-ui';
import { z } from 'zod';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadingState';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { useI18n } from '@quetzallabs/i18n';
import {
    OnboardingStatus,
    useActivateWorkspaceMutation,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

const StyledContentContainer = styled.div`
  width: 100%;
`;

const StyledSectionContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
  width: 200px;
`;

export const CreateWorkspace = () => {
  const { t } = useI18n();
  const validationSchema = z
    .object({
      name: z.string().min(1, {
        message: t('Name can not be empty'),
      }),
    })
    .required();
  type Form = z.infer<typeof validationSchema>;
  const { enqueueSnackBar } = useSnackBar();
  const onboardingStatus = useOnboardingStatus();

  const [activateWorkspace] = useActivateWorkspaceMutation();
  const apolloMetadataClient = useApolloMetadataClient();
  const setIsCurrentUserLoaded = useSetRecoilState(isCurrentUserLoadedState);

  // Form
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<Form>({
    mode: 'onChange',
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<Form> = useCallback(
    async (data) => {
      try {
        const result = await activateWorkspace({
          variables: {
            input: {
              displayName: data.name,
            },
          },
        });
        setIsCurrentUserLoaded(false);

        await apolloMetadataClient?.refetchQueries({
          include: [FIND_MANY_OBJECT_METADATA_ITEMS],
        });

        if (isDefined(result.errors)) {
          throw result.errors ?? new Error(t('Unknown error'));
        }
      } catch (error: any) {
        enqueueSnackBar(error?.message, {
          variant: SnackBarVariant.Error,
        });
      }
    },
    [
      activateWorkspace,
      setIsCurrentUserLoaded,
      apolloMetadataClient,
      enqueueSnackBar,
    ],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === Key.Enter) {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  if (onboardingStatus !== OnboardingStatus.WorkspaceActivation) {
    return null;
  }
  
  return (
    <>
      <Title noMarginTop>{t('Create your workspace')}</Title>
      <SubTitle>
        {t(
          'A shared environment where you will be able to manage your customer relations with your team.',
        )}
      </SubTitle>
      <StyledContentContainer>
        <StyledSectionContainer>
          <H2Title title={t('Workspace logo')} />
          <WorkspaceLogoUploader />
        </StyledSectionContainer>
        <StyledSectionContainer>
          <H2Title
            title={t('Workspace name')}
            description={t('The name of your organization')}
          />
          <Controller
            name="name"
            control={control}
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <TextInputV2
                autoFocus
                value={value}
                placeholder={t('Apple')}
                onBlur={onBlur}
                onChange={onChange}
                error={error?.message}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            )}
          />
        </StyledSectionContainer>
      </StyledContentContainer>
      <StyledButtonContainer>
        <MainButton
          title={t('Continue')}
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
          Icon={() => isSubmitting && <Loader />}
          fullWidth
        />
      </StyledButtonContainer>
    </>
  );
};
