// import { useGetNFTInfoQuery } from '@cactus-network/api-react';
import { fromBech32m } from '@cactus-network/api';
import { AddressBookContext, Color, EmojiAndColorPicker, Flex, Form, TextField } from '@cactus-network/core';
import { Trans } from '@lingui/macro';
import { Add, Remove } from '@mui/icons-material';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useContext, useState } from 'react';
import { useForm, useFormContext, useFieldArray } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';

// import { launcherIdFromNFTId } from '../../util/nfts';
// import NFTPreview from '../nfts/NFTPreview';

function AddressFields() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    name: 'addresses',
  });

  const handleAppend = (value) => {
    append(value);
  };

  const handleRemove = (index) => {
    remove(index);
  };

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">
          <Trans>Addresses</Trans>
        </Typography>
        <IconButton onClick={() => handleAppend({ name: '', address: '' })}>
          <Add />
        </IconButton>
      </Box>
      {fields.map((item, index) => (
        <Box key={item.id} display="flex" alignItems="center" justifyContent="space-between" gap={2}>
          <TextField
            render={({ field }) => <input {...field} />}
            defaultValue={item.name}
            name={`addresses[${index}].name`}
            control={control}
            variant="filled"
            color="secondary"
            fullWidth
            disabled={false}
            label={<Trans>Name</Trans>}
          />
          <TextField
            render={({ field }) => <input {...field} />}
            defaultValue={item.address}
            name={`addresses[${index}].address`}
            control={control}
            variant="filled"
            color="secondary"
            fullWidth
            disabled={false}
            label={<Trans>Address</Trans>}
          />
          <IconButton onClick={() => handleRemove(index)}>
            <Remove />
          </IconButton>
        </Box>
      ))}
    </>
  );
}

function ProfileFields() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dids',
  });

  const handleAppend = (value) => {
    append(value);
  };

  const handleRemove = (index) => {
    remove(index);
  };

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">
          <Trans>Profiles</Trans>
        </Typography>
        <IconButton onClick={() => handleAppend({ name: '', did: '' })}>
          <Add />
        </IconButton>
      </Box>
      {fields.map((item, index) => (
        <Box key={item.id} display="flex" alignItems="center" justifyContent="space-between" gap={2}>
          <TextField
            render={({ field }) => <input {...field} />}
            defaultValue={item.name}
            name={`dids[${index}].name`}
            control={control}
            variant="filled"
            color="secondary"
            fullWidth
            disabled={false}
            label={<Trans>Name</Trans>}
          />
          <TextField
            render={({ field }) => <input {...field} />}
            defaultValue={item.did}
            name={`dids[${index}].did`}
            control={control}
            variant="filled"
            color="secondary"
            fullWidth
            disabled={false}
            label={<Trans>DID</Trans>}
          />
          <IconButton onClick={() => handleRemove(index)}>
            <Remove />
          </IconButton>
        </Box>
      ))}
    </>
  );
}

function DomainFields() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'domains',
  });

  const handleAppend = (value) => {
    append(value);
  };

  const handleRemove = (index) => {
    remove(index);
  };

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">
          <Trans>Domain Names</Trans>
        </Typography>
        <IconButton onClick={() => handleAppend({ name: '', domain: '' })}>
          <Add />
        </IconButton>
      </Box>
      {fields.map((item, index) => (
        <Box key={item.id} display="flex" alignItems="center" justifyContent="space-between" gap={2}>
          <TextField
            render={({ field }) => <input {...field} />}
            defaultValue={item.name}
            name={`domains[${index}].name`}
            control={control}
            variant="filled"
            color="secondary"
            fullWidth
            disabled={false}
            label={<Trans>Name</Trans>}
          />
          <TextField
            render={({ field }) => <input {...field} />}
            defaultValue={item.address}
            name={`domains[${index}].domain`}
            control={control}
            variant="filled"
            color="secondary"
            fullWidth
            disabled={false}
            label={<Trans>Domain</Trans>}
          />
          <IconButton onClick={() => handleRemove(index)}>
            <Remove />
          </IconButton>
        </Box>
      ))}
    </>
  );
}

export default function ContactEdit() {
  const [addressBook, , , getContactContactId, editContact] = useContext(AddressBookContext);
  const { contactId } = useParams();
  const navigate = useNavigate();
  const contact = getContactContactId(Number(contactId));

  const theme: any = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [chosenEmoji, setChosenEmoji] = useState(contact.emoji);

  const methods = useForm<ContactEditData>({
    defaultValues: {
      name: contact.name,
      addresses: contact.addresses,
      dids: contact.dids,
      domains: contact.domainNames,
      notes: '',
      nftId: '',
    },
  });

  function handleCancel(id: number) {
    navigate(`/dashboard/addressbook/${id}`);
  }

  function handleSubmit(data) {
    if (data.name === 0) throw new Error('A name must be provided for each contact');
    const filteredAddresses = data.addresses.filter((item) => item.name.length > 0 || item.address.length > 0);
    const filteredProfiles = data.dids.filter((item) => item.name.length > 0 || item.did.length > 0);
    const filteredDomains = data.domains.filter((item) => item.name.length > 0 || item.domain.length > 0);
    if (filteredAddresses.length === 0) throw new Error('At least one Address must be provided to create contact');
    filteredAddresses.forEach((entry) => {
      try {
        if (entry.address[3] === '1') {
          if (entry.address.slice(0, 3).toLowerCase() !== 'cac') {
            throw new Error();
          } else if (fromBech32m(entry.address).length !== 64) {
            throw new Error();
          }
        } else if (entry.address[4] === '1') {
          if (entry.address.slice(0, 4).toLowerCase() !== 'tcac') {
            throw new Error();
          } else if (fromBech32m(entry.address).length !== 64) {
            throw new Error();
          }
        } else {
          throw new Error();
        }
      } catch (err) {
        throw new Error(`${entry.address} is not a valid address`);
      }
      addressBook.forEach((abContact) => {
        if (abContact.contactId.toString() !== contactId) {
          abContact.addresses.forEach((contactAddress) => {
            if (contactAddress.address === entry.address) {
              throw new Error(
                `The address ${entry.address} is already assigned to an existing contact: ${abContact.name}`,
              );
            }
          });
        }
      });
    });
    filteredProfiles.forEach((entry) => {
      try {
        if (entry.did.slice(0, 9).toLowerCase() !== 'did:cactus:') {
          throw new Error();
        } else if (fromBech32m(entry.did).length !== 64) {
          throw new Error();
        }
      } catch (err) {
        throw new Error(`${entry.did} is not a valid DID`);
      }
      addressBook.forEach((abContact) => {
        if (abContact.contactId.toString() !== contactId) {
          abContact.dids.forEach((contactDID) => {
            if (contactDID.did === entry.did) {
              throw new Error(`The profile ${entry.did} is already assigned to an existing contact: ${abContact.name}`);
            }
          });
        }
      });
    });
    editContact(
      contact.contactId,
      data.name,
      filteredAddresses,
      filteredProfiles,
      data.notes,
      data.nftId,
      filteredDomains,
      chosenEmoji,
    );
    navigate(`/dashboard/addressbook/${Number(contact.contactId)}`);
  }

  return (
    <div>
      <Form methods={methods} key={0} onSubmit={handleSubmit}>
        <Flex flexDirection="column" gap={1} alignItems="left" style={{ paddingLeft: '44px', paddingRight: '44px' }}>
          <Flex flexDirection="row" alignItems="center" style={{ paddingTop: '2px' }}>
            <Flex flexGrow={1}>
              <Typography variant="h5">
                <Trans>Edit Contact</Trans>
              </Typography>
            </Flex>
            <Flex gap={1}>
              <Button variant="contained" color="primary" type="submit">
                <Trans>Save</Trans>
              </Button>
              <Button variant="outlined" color="secondary" onClick={() => handleCancel(Number(contact.contactId))}>
                <Trans>Cancel</Trans>
              </Button>
            </Flex>
          </Flex>

          <Flex flexDirection="column" gap={6} style={{ width: '100%', paddingTop: '38px' }}>
            <Flex gap={2} flexDirection="column">
              <Typography variant="h6">
                <Trans>Theme</Trans>
              </Typography>
              <Flex minWidth={0} alignItems="baseline">
                <span
                  style={{ display: showEmojiPicker ? 'inline' : 'none', position: 'fixed', zIndex: 10 }}
                  onClick={() => {}}
                >
                  {showEmojiPicker && (
                    <EmojiAndColorPicker
                      onSelect={(result: any) => {
                        setChosenEmoji(result);
                        setShowEmojiPicker(false);
                      }}
                      onClickOutside={() => {
                        setShowEmojiPicker(false);
                      }}
                      currentEmoji={chosenEmoji}
                      themeColors={theme.palette.colors}
                      isDark={isDark}
                      emojiOnly
                    />
                  )}
                </span>
                <Flex flexDirection="row" minWidth={0}>
                  <Box
                    sx={{
                      backgroundColor: 'none',
                      fontSize: '26px',
                      marginRight: '10px',
                      width: '40px',
                      height: '40px',
                      lineHeight: '42px',
                      textAlign: 'center',
                      borderRadius: '5px',
                      border: 1,
                      borderColor: isDark ? Color.Neutral[400] : Color.Neutral[300],
                      ':hover': {
                        cursor: 'pointer',
                        backgroundColor: isDark ? Color.Neutral[400] : Color.Neutral[300],
                      },
                    }}
                    onClick={() => setShowEmojiPicker(true)}
                  >
                    {chosenEmoji}
                  </Box>
                </Flex>
              </Flex>
            </Flex>
            <Flex gap={2} flexDirection="column">
              <Typography variant="h6">
                <Trans>Contact Name</Trans>
              </Typography>
              <TextField
                name="name"
                variant="filled"
                color="secondary"
                fullWidth
                disabled={false}
                label={<Trans>Name</Trans>}
                required
              />
            </Flex>
            <Flex gap={2} flexDirection="column">
              <AddressFields />
            </Flex>
            <Flex gap={2} flexDirection="column">
              <ProfileFields />
            </Flex>
            <Flex gap={2} flexDirection="column">
              <DomainFields />
            </Flex>
          </Flex>
        </Flex>
      </Form>
    </div>
  );
}

type ContactEditData = {
  name: string;
  addresses: [];
  dids: [];
  domains: [];
  notes: string;
  nftId: string;
};
