import { isNonEmptyString } from '@sniptt/guards';
import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { AppPath } from '@/types/AppPath';
import { useI18n } from '@quetzallabs/i18n';
import { useImpersonateMutation } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const ImpersonateEffect = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { userId } = useParams();

  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
  const setTokenPair = useSetRecoilState(tokenPairState);

  const [impersonate] = useImpersonateMutation();

  const isLogged = useIsLogged();

  const handleImpersonate = useCallback(async () => {
    if (!isNonEmptyString(userId)) {
      return;
    }

    const impersonateResult = await impersonate({
      variables: {
        userId,
      },
    });

    if (isDefined(impersonateResult.errors)) {
      throw impersonateResult.errors;
    }

    if (!impersonateResult.data?.impersonate) {
      throw new Error(t('No impersonate result'));
    }

    setCurrentUser({
      ...impersonateResult.data.impersonate.user,
      // Todo also set WorkspaceMember
    });
    setTokenPair(impersonateResult.data?.impersonate.tokens);

    return impersonateResult.data?.impersonate;
  }, [userId, impersonate, setCurrentUser, setTokenPair]);

  useEffect(() => {
    if (
      isLogged &&
      currentUser?.canImpersonate === true &&
      isNonEmptyString(userId)
    ) {
      handleImpersonate();
    } else {
      // User is not allowed to impersonate or not logged in
      navigate(AppPath.Index);
    }
  }, [userId, currentUser, isLogged, handleImpersonate, navigate]);

  return <></>;
};
