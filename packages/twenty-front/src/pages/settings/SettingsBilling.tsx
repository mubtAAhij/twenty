import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
    Button,
    H2Title,
    IconCalendarEvent,
    IconCircleX,
    IconCreditCard,
    Info,
    Section,
} from 'twenty-ui';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsBillingCoverImage } from '@/billing/components/SettingsBillingCoverImage';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useI18n } from '@quetzallabs/i18n';
import {
    OnboardingStatus,
    SubscriptionInterval,
    SubscriptionStatus,
    useBillingPortalSessionQuery,
    useUpdateBillingSubscriptionMutation,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

type SwitchInfo = {
  newInterval: SubscriptionInterval;
  to: string;
  from: string;
  impact: string;
};

export const SettingsBilling = () => {
  const { t } = useI18n();
  const MONTHLY_SWITCH_INFO: SwitchInfo = {
    newInterval: SubscriptionInterval.Year,
    to: t('to yearly'),
    from: t('from monthly to yearly'),
    impact: t('You will be charged immediately for the full year.'),
  };

  const YEARLY_SWITCH_INFO: SwitchInfo = {
    newInterval: SubscriptionInterval.Month,
    to: t('to monthly'),
    from: t('from yearly to monthly'),
    impact: t('Your credit balance will be used to pay the monthly bills.'),
  };

  const SWITCH_INFOS = {
    year: YEARLY_SWITCH_INFO,
    month: MONTHLY_SWITCH_INFO,
  };

  const { enqueueSnackBar } = useSnackBar();
  const onboardingStatus = useOnboardingStatus();
  const subscriptionStatus = useSubscriptionStatus();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const switchingInfo =
    currentWorkspace?.currentBillingSubscription?.interval ===
    SubscriptionInterval.Year
      ? SWITCH_INFOS.year
      : SWITCH_INFOS.month;
  const [isSwitchingIntervalModalOpen, setIsSwitchingIntervalModalOpen] =
    useState(false);
  const [updateBillingSubscription] = useUpdateBillingSubscriptionMutation();
  const { data, loading } = useBillingPortalSessionQuery({
    variables: {
      returnUrlPath: '/settings/billing',
    },
  });

  const billingPortalButtonDisabled =
    loading || !isDefined(data) || !isDefined(data.billingPortalSession.url);

  const switchIntervalButtonDisabled =
    onboardingStatus !== OnboardingStatus.Completed;

  const cancelPlanButtonDisabled =
    billingPortalButtonDisabled ||
    onboardingStatus !== OnboardingStatus.Completed;

  const displayPaymentFailInfo =
    subscriptionStatus === SubscriptionStatus.PastDue ||
    subscriptionStatus === SubscriptionStatus.Unpaid;

  const displaySubscriptionCanceledInfo =
    subscriptionStatus === SubscriptionStatus.Canceled;

  const displaySubscribeInfo =
    onboardingStatus === OnboardingStatus.Completed &&
    !isDefined(subscriptionStatus);

  const openBillingPortal = () => {
    if (isDefined(data) && isDefined(data.billingPortalSession.url)) {
      window.location.replace(data.billingPortalSession.url);
    }
  };

  const openSwitchingIntervalModal = () => {
    setIsSwitchingIntervalModalOpen(true);
  };

  const switchInterval = async () => {
    try {
      await updateBillingSubscription();
      if (isDefined(currentWorkspace?.currentBillingSubscription)) {
        const newCurrentWorkspace = {
          ...currentWorkspace,
          currentBillingSubscription: {
            ...currentWorkspace?.currentBillingSubscription,
            interval: switchingInfo.newInterval,
          },
        };
        setCurrentWorkspace(newCurrentWorkspace);
      }
      enqueueSnackBar(
        t('Subscription has been switched {dynamic1}', {
          dynamic1: switchingInfo.to,
        }),
        {
          variant: SnackBarVariant.Success,
        },
      );
    } catch (error: any) {
      enqueueSnackBar(
        t('Error while switching subscription {dynamic1}.', {
          dynamic1: switchingInfo.to,
        }),
        {
          variant: SnackBarVariant.Error,
        },
      );
    }
  };
  
  return (
    <SubMenuTopBarContainer
      title={t('Billing')}
      links={[
        {
          children: t('Workspace'),
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        {
          children: t('Billing'),
        },
      ]}
    >
      <SettingsPageContainer>
        <SettingsBillingCoverImage />
        {displayPaymentFailInfo && (
          <Info
            text={t('Last payment failed. Please update your billing details.')}
            buttonTitle={t('Update')}
            accent={'danger'}
            onClick={openBillingPortal}
          />
        )}
        {displaySubscriptionCanceledInfo && (
          <Info
            text={t('Subscription canceled. Please start a new one')}
            buttonTitle={t('Subscribe')}
            accent={'danger'}
            to={AppPath.PlanRequired}
          />
        )}
        {displaySubscribeInfo ? (
          <Info
            text={t('Your workspace does not have an active subscription')}
            buttonTitle={t('Subscribe')}
            accent={'danger'}
            to={AppPath.PlanRequired}
          />
        ) : (
          <>
            <Section>
              <H2Title
                title={t('Manage your subscription')}
                description={t(
                  'Edit payment method, see your invoices and more',
                )}
              />
              <Button
                Icon={IconCreditCard}
                title={t('View billing details')}
                variant="secondary"
                onClick={openBillingPortal}
                disabled={billingPortalButtonDisabled}
              />
            </Section>
            <Section>
              <H2Title
                title={t('Edit billing interval')}
                description={t('Switch {dynamic1}', {
                  dynamic1: switchingInfo.from,
                })}
              />
              <Button
                Icon={IconCalendarEvent}
                title={t('Switch {dynamic1}', {
                  dynamic1: switchingInfo.to,
                })}
                variant="secondary"
                onClick={openSwitchingIntervalModal}
                disabled={switchIntervalButtonDisabled}
              />
            </Section>
            <Section>
              <H2Title
                title={t('Cancel your subscription')}
                description={t('Your workspace will be disabled')}
              />
              <Button
                Icon={IconCircleX}
                title={t('Cancel Plan')}
                variant="secondary"
                accent="danger"
                onClick={openBillingPortal}
                disabled={cancelPlanButtonDisabled}
              />
            </Section>
          </>
        )}
      </SettingsPageContainer>
      <ConfirmationModal
        isOpen={isSwitchingIntervalModalOpen}
        setIsOpen={setIsSwitchingIntervalModalOpen}
        title={t('Switch billing {dynamic1}', {
          dynamic1: switchingInfo.to,
        })}
        subtitle={
          <>
            {t(
              'Are you sure that you want to change your billing interval? {dynamic1}',
              {
                dynamic1: switchingInfo.impact,
              },
            )}
          </>
        }
        onConfirmClick={switchInterval}
        deleteButtonText={t('Change {dynamic1}', {
          dynamic1: switchingInfo.to,
        })}
        confirmButtonAccent={'blue'}
      />
    </SubMenuTopBarContainer>
  );
};
