import { fromBech32m } from '@cactus-network/api';
import { useGetDIDQuery, useGetDIDNameQuery, useSetDIDNameMutation } from '@cactus-network/api-react';
import { Color, CopyToClipboard, Flex, Loading, Tooltip, truncateValue } from '@cactus-network/core';
import { Trans } from '@lingui/macro';
import { alpha, Box, Card, TextField, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { didToDIDId } from '../../util/dids';
import removeHexPrefix from '../../util/removeHexPrefix';

const StyledCard = styled(Card)(
  ({ theme }) => `
  width: 100%;
  padding: ${theme.spacing(3)};
  border-radius: ${theme.spacing(1)};
  background-color: ${theme.palette.background.paper};
`,
);

const StyledTitle = styled(Box)`
  font-size: 0.625rem;
  color: ${alpha(Color.Neutral[50], 0.7)};
`;

const StyledValue = styled(Box)`
  word-break: break-all;
`;

function InlineEdit({ text, walletId }) {
  const [editedText, setEditedText] = useState(text);
  const [setDid] = useSetDIDNameMutation();

  useEffect(() => {
    setEditedText(text);
  }, [text]);

  const handleChange = (event) => setEditedText(event.target.value);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.target.blur();
    }
  };

  const handleBlur = (event) => {
    if (event.target.value.trim() === '') {
      setEditedText(text);
    } else {
      setDid({ walletId, name: event.target.value });
    }
  };

  return (
    <TextField
      label={<Trans>Profile Name</Trans>}
      value={editedText || ''}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      fullWidth
    />
  );
}

export default function ProfileView() {
  const { walletId } = useParams<{
    walletId: string;
  }>();

  const { data: did, isLoading: isLoadingDID } = useGetDIDQuery({ walletId: Number(walletId) });
  const { data: didName, isLoading: isLoadingDIDName } = useGetDIDNameQuery({ walletId: Number(walletId) });

  const isLoading = isLoadingDID || isLoadingDIDName;

  if (isLoading) {
    return <Loading center />;
  }

  if (did && didName) {
    const nameText = didName.name;
    const didID = didToDIDId(did.myDid);
    const hexDID = removeHexPrefix(fromBech32m(didID));
    const truncatedDID = truncateValue(didID, {});

    return (
      <div style={{ width: '100%' }}>
        <StyledCard>
          <Flex flexDirection="column" gap={2.5} paddingBottom={3}>
            <InlineEdit text={nameText} walletId={walletId} />
          </Flex>
          <Flex flexDirection="row" paddingBottom={1}>
            <Flex flexGrow={1}>
              <Trans>My DID</Trans>
            </Flex>
            <Flex>
              <Tooltip
                title={
                  <Flex flexDirection="column" gap={1}>
                    <Flex flexDirection="column" gap={0}>
                      <Flex>
                        <Box flexGrow={1}>
                          <StyledTitle>DID ID</StyledTitle>
                        </Box>
                      </Flex>
                      <Flex alignItems="center" gap={1}>
                        <StyledValue>{didID}</StyledValue>
                        <CopyToClipboard value={didID} fontSize="small" />
                      </Flex>
                    </Flex>
                    <Flex flexDirection="column" gap={0}>
                      <Flex>
                        <Box flexGrow={1}>
                          <StyledTitle>DID ID (Hex)</StyledTitle>
                        </Box>
                      </Flex>
                      <Flex alignItems="center" gap={1}>
                        <StyledValue>{hexDID}</StyledValue>
                        <CopyToClipboard value={hexDID} fontSize="small" />
                      </Flex>
                    </Flex>
                  </Flex>
                }
              >
                <Typography variant="body2">{truncatedDID}</Typography>
              </Tooltip>
            </Flex>
          </Flex>
          <Flex flexDirection="row" paddingBottom={1}>
            <Flex flexGrow={1}>
              <Trans>Token Standard</Trans>
            </Flex>
            <Flex>DID1</Flex>
          </Flex>
        </StyledCard>
      </div>
    );
  }

  return null;
}
