import { Button, CopyToClipboard, Flex, Link, Loading, TextField, Form } from '@cactus-network/core';
import { Trans } from '@lingui/macro';
import { Alert, Dialog, DialogActions, DialogTitle, DialogContent, Typography, InputAdornment } from '@mui/material';
import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import usePayoutAddress from '../../hooks/usePayoutAddress';
import PlotNFT from '../../types/PlotNFT';
import PlotNFTExternal from '../../types/PlotNFTExternal';

type FormData = {
  payoutAddress: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  nft: PlotNFT | PlotNFTExternal;
};

export default function PlotNFTPayoutInstructionsDialog(props: Props) {
  const { onClose, open, nft } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const { payoutAddress, setPayoutAddress } = usePayoutAddress(nft);

  const methods = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      payoutAddress: payoutAddress || '',
    },
  });

  const currentPayoutAddress = useWatch({
    name: 'payoutAddress',
    control: methods.control,
  });

  function handleClose() {
    onClose();
  }

  async function handleSubmit(values) {
    try {
      setError(undefined);
      setLoading(true);
      await setPayoutAddress(values.payoutAddress);
      setLoading(false);
      onClose();
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  }

  function handleDialogClose(event: any, reason: any) {
    if (reason !== 'backdropClick' || reason !== 'EscapeKeyDown') {
      onClose();
    }
  }

  return (
    <Dialog onClose={handleDialogClose} maxWidth="md" open={open}>
      <Form methods={methods} onSubmit={handleSubmit}>
        <DialogTitle>
          <Trans>Edit Payout Instructions</Trans>
        </DialogTitle>
        <DialogContent dividers>
          <Flex gap={2} flexDirection="column">
            {loading ? (
              <Loading center />
            ) : (
              <Flex flexDirection="column" gap={2}>
                {error && <Alert severity="error">{error.message}</Alert>}

                <TextField
                  label={<Trans>Pool Payout Instructions</Trans>}
                  name="payoutAddress"
                  variant="filled"
                  InputProps={{
                    spellCheck: false,
                    endAdornment: (
                      <InputAdornment position="end">
                        <CopyToClipboard value={currentPayoutAddress} />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />

                <Typography variant="body2" color="textSecondary">
                  <Trans>
                    These are the instructions for how the farmer wants to get paid. By default this will be an CAC
                    address, but it can be set to any string with a size of less than 1024 characters, so it can
                    represent another blockchain or payment system identifier.
                  </Trans>{' '}
                  <Link
                    target="_blank"
                    href="https://github.com/Cactus-Network/pool-reference/blob/main/SPECIFICATION.md#payloadpayout_instructions"
                    noWrap
                  >
                    <Trans>Learn More</Trans>
                  </Link>
                </Typography>
              </Flex>
            )}
          </Flex>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            <Trans>Cancel</Trans>
          </Button>
          <Button color="primary" type="submit">
            <Trans>Save</Trans>
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
