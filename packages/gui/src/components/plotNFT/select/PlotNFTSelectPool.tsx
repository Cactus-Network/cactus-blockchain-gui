import { ButtonLoading, Loading, Flex, Form, Back, cactusToMojo, ConfirmDialog, useOpenDialog } from '@cactus-network/core';
import { t, Trans } from '@lingui/macro';
import { Alert } from '@mui/material';
import React, { useState, ReactNode, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';

import usePlotNFTs from '../../../hooks/usePlotNFTs';
import useStandardWallet from '../../../hooks/useStandardWallet';
import InitialTargetState from '../../../types/InitialTargetState';
import getPoolInfo from '../../../util/getPoolInfo';
import normalizeUrl from '../../../util/normalizeUrl';

import PlotNFTSelectBase from './PlotNFTSelectBase';
import PlotNFTSelectFaucet from './PlotNFTSelectFaucet';

export type SubmitData = {
  initialTargetState: InitialTargetState;
  fee?: string;
};

async function prepareSubmitData(data: FormData): SubmitData {
  const { self, fee, poolUrl } = data;
  const initialTargetState = {
    state: self ? 'SELF_POOLING' : 'FARMING_TO_POOL',
  };

  if (!self && poolUrl) {
    const normalizedPoolUrl = normalizeUrl(poolUrl);
    const { targetPuzzleHash, relativeLockHeight } = await getPoolInfo(normalizedPoolUrl);
    if (!targetPuzzleHash) {
      throw new Error(t`Pool does not provide targetPuzzleHash.`);
    }
    if (relativeLockHeight === undefined) {
      throw new Error(t`Pool does not provide relativeLockHeight.`);
    }

    initialTargetState.poolUrl = normalizedPoolUrl;
    initialTargetState.targetPuzzleHash = targetPuzzleHash;
    initialTargetState.relativeLockHeight = relativeLockHeight;
  }

  const feeMojos = cactusToMojo(fee || '0');

  return {
    fee: feeMojos,
    initialTargetState,
  };
}

type FormData = {
  self: boolean;
  poolUrl?: string;
  fee?: string | number;
};

type Props = {
  step?: number;
  onCancel?: () => void;
  title: ReactNode;
  description?: ReactNode;
  submitTitle?: ReactNode;
  hideFee?: boolean;
  onSubmit: (data: SubmitData) => Promise<void>;
  defaultValues?: {
    fee?: string;
    self?: boolean;
    poolUrl?: string;
  };
  feeDescription?: ReactNode;
  setShowingPoolDetails?: (showing: boolean) => void;
};

const PlotNFTSelectPool = forwardRef((props: Props, ref) => {
  const {
    step,
    onCancel,
    defaultValues,
    onSubmit,
    title,
    description,
    submitTitle = <Trans>Create</Trans>,
    hideFee = false,
    feeDescription,
    setShowingPoolDetails,
  } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const { balance, loading: walletLoading } = useStandardWallet();
  const { nfts } = usePlotNFTs();
  const openDialog = useOpenDialog();
  const exceededNFTLimit = nfts?.length >= 50;
  const hasBalance = !!balance && balance > 0;

  const methods = useForm<FormData>({
    defaultValues: {
      fee: '',
      self: true,
      poolUrl: '',
      ...defaultValues,
    },
  });

  useImperativeHandle(ref, () => ({
    async getSubmitData() {
      const data = methods.getValues();

      return prepareSubmitData(data);
    },
  }));

  async function handleSubmit(data: FormData) {
    let createNFT = true;
    if (nfts?.length > 10) {
      createNFT = await openDialog(
        <ConfirmDialog title={<Trans>Too Many Plot NFTs</Trans>} confirmColor="danger">
          <Trans>You already have more than 10 Plot NFTs. Click OK if you're sure you want to create a new one.</Trans>
        </ConfirmDialog>,
      );
    }
    if (createNFT && !exceededNFTLimit) {
      try {
        setLoading(true);

        const submitData = await prepareSubmitData(data);

        await onSubmit(submitData);
      } finally {
        setLoading(false);
      }
    }
  }

  if (walletLoading) {
    return <Loading />;
  }

  if (!hasBalance) {
    return (
      <Flex flexDirection="column" gap={3}>
        {!onCancel && (
          <Form methods={methods} onSubmit={handleSubmit}>
            <Back variant="h5" form>
              <Trans>Join a Pool</Trans>
            </Back>
          </Form>
        )}
        <PlotNFTSelectFaucet step={step} onCancel={onCancel} />
      </Flex>
    );
  }

  return (
    <Form methods={methods} onSubmit={handleSubmit}>
      <Flex flexDirection="column" gap={3}>
        {!onCancel && (
          <Back variant="h5" form>
            <Trans>Join a Pool</Trans>
          </Back>
        )}

        <PlotNFTSelectBase
          step={step}
          onCancel={onCancel}
          title={title}
          description={description}
          hideFee={hideFee}
          feeDescription={feeDescription}
          setShowingPoolDetails={setShowingPoolDetails}
        />
        {exceededNFTLimit && (
          <Alert severity="error">
            <Trans>You already have 50 or more Plot NFTs.</Trans>
          </Alert>
        )}
        {!onCancel && (
          <Flex gap={1} justifyContent="right">
            <ButtonLoading
              loading={loading}
              disabled={exceededNFTLimit}
              color="primary"
              type="submit"
              variant="contained"
            >
              {submitTitle}
            </ButtonLoading>
          </Flex>
        )}
      </Flex>
    </Form>
  );
});

export default PlotNFTSelectPool;
