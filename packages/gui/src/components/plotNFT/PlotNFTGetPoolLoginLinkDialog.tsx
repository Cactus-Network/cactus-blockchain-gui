import type { PlotNFT, PlotNFTExternal } from '@cactus-network/api';
import { useGetPoolLoginLinkQuery } from '@cactus-network/api-react';
import { Button, CopyToClipboard, Flex, Link, Loading } from '@cactus-network/core';
import { Trans } from '@lingui/macro';
import { Alert, Dialog, DialogActions, DialogTitle, DialogContent, Typography } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

const StyledLoginLink = styled(Typography)`
  word-break: break-all;
`;

type Props = {
  open: boolean;
  onClose: () => void;
  nft: PlotNFT | PlotNFTExternal;
};

export default function PlotNFTGetPoolLoginLinkDialog(props: Props) {
  const { onClose, open, nft } = props;
  const {
    poolState: {
      poolConfig: { poolUrl, launcherId },
    },
  } = nft;

  const {
    data: loginLink,
    isLoading,
    error,
  } = useGetPoolLoginLinkQuery(
    {
      launcherId,
    },
    {
      skip: !poolUrl,
    },
  );

  function handleClose() {
    onClose();
  }

  function handleDialogClose(event: any, reason: any) {
    if (reason !== 'backdropClick' || reason !== 'EscapeKeyDown') {
      onClose();
    }
  }

  return (
    <Dialog onClose={handleDialogClose} maxWidth="md" open={open}>
      <DialogTitle>
        <Trans>Pool Login Link</Trans>
      </DialogTitle>
      <DialogContent dividers>
        <Flex gap={2} flexDirection="column">
          {isLoading ? (
            <Loading center />
          ) : (
            <Flex flexDirection="column" gap={2}>
              {error && <Alert severity="error">{error.message}</Alert>}

              <StyledLoginLink variant="body2">{loginLink}</StyledLoginLink>

              <Typography variant="body2" color="textSecondary">
                <Trans>
                  It is a one-time login link that can be used to log in to a pool's website. It contains a signature
                  using the farmer's key from the plot NFT. Not all pools support this feature.
                </Trans>{' '}
                <Link
                  target="_blank"
                  href="https://github.com/Cactus-Network/pool-reference/blob/main/SPECIFICATION.md#get-login"
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
        {loginLink && <CopyToClipboard value={loginLink} size="medium" />}

        <Button onClick={handleClose} color="secondary">
          <Trans>OK</Trans>
        </Button>
      </DialogActions>
    </Dialog>
  );
}
