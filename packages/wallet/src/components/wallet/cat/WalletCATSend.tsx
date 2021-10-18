import React from 'react';
import { Trans, t } from '@lingui/macro';
import {
  AdvancedOptions,
  Fee,
  Form,
  AlertDialog,
  Flex,
  Card,
  ButtonLoading,
  TextFieldNumber,
  TextField,
  useOpenDialog,
} from '@chia/core';
import { 
  useSpendCATMutation,
  useGetSyncStatusQuery,
  useFarmBlockMutation,
} from '@chia/api-react';
import isNumeric from 'validator/es/lib/isNumeric';
import { useForm, useWatch } from 'react-hook-form';
import { Button, Grid } from '@material-ui/core';
import { chia_to_mojo, colouredcoin_to_mojo } from '../../../util/chia';
import { get_transaction_result } from '../../../util/transaction_result';
import config from '../../../config/config';
import useWallet from '../../../hooks/useWallet';

type Props = {
  walletId: number;
};

type SendTransactionData = {
  address: string;
  amount: string;
  fee: string;
  memo: string;
};

export default function WalletCATSend(props: Props) {
  const { walletId } = props;
  const openDialog = useOpenDialog();
  const [farmBlock] = useFarmBlockMutation();
  const [spendCAT, { isLoading: isSpendCatLoading }] = useSpendCATMutation();
  const { data: walletState, isLoading: isWalletSyncLoading } = useGetSyncStatusQuery();

  const methods = useForm<SendTransactionData>({
    shouldUnregister: false,
    defaultValues: {
      address: '',
      amount: '',
      fee: '',
      memo: '',
    },
  });

  const { formState: { isSubmitting } } = methods;

  const addressValue = useWatch<string>({
    control: methods.control,
    name: 'address',
  });

  const { wallet, unit, loading } = useWallet(walletId);

  const isLoading = isSpendCatLoading || isWalletSyncLoading || loading;
  if (!wallet || isLoading) {
    return null;
  }

  const { tail } = wallet.meta;
  const syncing = walletState.syncing;

  async function farm() {
    if (addressValue) {
      await farmBlock({
        address: addressValue,
      }).unwrap();
    }
  }

  async function handleSubmit(data: SendTransactionData) {
    try {
    if (isSpendCatLoading) {
      return;
    }

    if (syncing) {
      throw new Error(t`Please finish syncing before making a transaction`);
    }

    const amount = data.amount.trim();
    if (!isNumeric(amount)) {
      throw new Error(t`Please enter a valid numeric amount`);
    }

    const fee = data.fee.trim() || '0';
    if (!isNumeric(fee)) {
      throw new Error(t`Please enter a valid numeric fee`);
    }

    let address = data.address;
    if (address.includes('colour')) {
      throw new Error(t`Cannot send chia to coloured address. Please enter a chia address.`);
    }

    if (address.includes('chia_addr') || address.includes('colour_desc')) {
      throw new Error(t`Recipient address is not a coloured wallet address. Please enter a coloured wallet address`);
    }
    if (address.slice(0, 14) === 'colour_addr://') {
      const colour_id = address.slice(14, 78);
      address = address.slice(79);
      if (colour_id !== tail) {
        throw new Error(t`Error the entered address appears to be for a different colour.`);
      }
    }

    if (address.slice(0, 12) === 'chia_addr://') {
      address = address.slice(12);
    }
    if (address.startsWith('0x') || address.startsWith('0X')) {
      address = address.slice(2);
    }

    const amountValue = Number.parseFloat(colouredcoin_to_mojo(amount));
    const feeValue = Number.parseFloat(chia_to_mojo(fee));

    const memo = data.memo.trim();
    const memos = memo ? [memo] : undefined;

    const queryData = {
      walletId,
      address,
      amount: amountValue,
      fee: feeValue,
    };

    if (memos) {
      queryData.memos = memos;
    }

    console.log('queryData', queryData);
    const response = await spendCAT(queryData).unwrap();
    console.log('response', response);

    const result = get_transaction_result(response);
    if (result.success) {
        openDialog(
          <AlertDialog title={<Trans>Success</Trans>}>
            {result.message ?? <Trans>Transaction has successfully been sent to a full node and included in the mempool.</Trans>}
          </AlertDialog>,
        );
    } else {
      throw new Error(result.message ?? 'Something went wrong');
    }

    methods.reset();
  } catch (error) {
    console.log(error);
  }
  }

  return (
    <Card
      title={<Trans>Create Transaction</Trans>}
      tooltip={
        <Trans>
          On average there is one minute between each transaction block. Unless
          there is congestion you can expect your transaction to be included in
          less than a minute.
        </Trans>
      }
    >
      <Form methods={methods} onSubmit={handleSubmit}>
        <Grid spacing={2} container>
          <Grid xs={12} item>
            <TextField
              name="address"
              variant="filled"
              color="secondary"
              fullWidth
              disabled={isSubmitting}
              label={<Trans>Address / Puzzle hash</Trans>}
              required
            />
          </Grid>
          <Grid xs={12} md={6} item>
            <TextFieldNumber
              id="filled-secondary"
              variant="filled"
              color="secondary"
              name="amount"
              disabled={isSubmitting}
              label={<Trans>Amount</Trans>}
              currency={unit}
              fullWidth
              required
            />
          </Grid>
          <Grid xs={12} md={6} item>
            <Fee
              id="filled-secondary"
              variant="filled"
              name="fee"
              color="secondary"
              disabled={isSubmitting}
              label={<Trans>Fee</Trans>}
              fullWidth
            />
          </Grid>
          <Grid xs={12} item>
            <AdvancedOptions>
              <TextField
                name="memo"
                variant="filled"
                color="secondary"
                fullWidth
                disabled={isSubmitting}
                label={<Trans>Memo</Trans>}
              />
            </AdvancedOptions>
          </Grid>
          <Grid xs={12} item>
            <Flex justifyContent="flex-end" gap={1}>
              {!!config.local_test && (
                <Button onClick={farm} variant="outlined">
                  <Trans>Farm</Trans>
                </Button>
              )}
              <ButtonLoading
                variant="contained"
                color="primary"
                type="submit"
                disabled={isSpendCatLoading}
                loading={isSpendCatLoading}
              >
                <Trans>Send</Trans>
              </ButtonLoading>
            </Flex>
          </Grid>
        </Grid>
      </Form>
    </Card>
  );
}
