import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import {
    AnimatedEaseIn,
    IconCheck,
    MainButton,
    RGBA,
    UndecoratedLink,
} from 'twenty-ui';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentUserState } from '@/auth/states/currentUserState';
import { AppPath } from '@/types/AppPath';
import { useI18n } from '@quetzallabs/i18n';
import { OnboardingStatus } from '~/generated/graphql';

const StyledCheckContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  border: 2px solid ${(props) => props.color};
  border-radius: ${({ theme }) => theme.border.radius.rounded};
  box-shadow: ${(props) =>
    props.color && `-4px 4px 0 -2px ${RGBA(props.color, 1)}`};
  height: 36px;
  width: 36px;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

export const PaymentSuccess = () => {
  const { t } = useI18n();
  const theme = useTheme();
  const currentUser = useRecoilValue(currentUserState);
  const color =
    theme.name === 'light' ? theme.grayScale.gray90 : theme.grayScale.gray10;

  if (currentUser?.onboardingStatus === OnboardingStatus.Completed) {
    return <></>;
  }
  
  return (
    <>
      <AnimatedEaseIn>
        <StyledCheckContainer color={color}>
          <IconCheck color={color} size={24} stroke={3} />
        </StyledCheckContainer>
      </AnimatedEaseIn>
      <Title>{t('All set!')}</Title>
      <SubTitle>{t('Your account has been activated.')}</SubTitle>
      <StyledButtonContainer>
        <UndecoratedLink to={AppPath.CreateWorkspace}>
          <MainButton title={t('Start')} width={200} />
        </UndecoratedLink>
      </StyledButtonContainer>
    </>
  );
};
