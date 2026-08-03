import { classifyDappCommands } from './classifyDappCommands';

describe('classifyDappCommands', () => {
  it('returns empty groups when no commands are requested', () => {
    expect(classifyDappCommands([])).toEqual({
      innocuous: [],
      balance: [],
      sign: [],
      notifications: [],
      spending: [],
      other: [],
    });
  });

  it('classifies known commands into permission groups without changing request order within each group', () => {
    expect(
      classifyDappCommands([
        'cactus_getWallets',
        'cactus_getWalletBalance',
        'cactus_signMessageByAddress',
        'cactus_showNotification',
        'cactus_requestPermissions',
        'cactus_sendTransaction',
        'cactus_getTransaction',
        'cactus_getWalletBalances',
        'cactus_signMessageById',
        'cactus_pushTransactions',
        'cactus_getPublicKey',
        'cactus_transferDID',
      ]),
    ).toEqual({
      innocuous: ['cactus_getWallets', 'cactus_getTransaction'],
      balance: ['cactus_getWalletBalance', 'cactus_getWalletBalances'],
      sign: ['cactus_signMessageByAddress', 'cactus_signMessageById'],
      notifications: ['cactus_showNotification'],
      spending: ['cactus_sendTransaction', 'cactus_pushTransactions', 'cactus_transferDID'],
      other: ['cactus_requestPermissions', 'cactus_getPublicKey'],
    });
  });

  it('rejects duplicate command entries before granting permissions', () => {
    expect(() => classifyDappCommands(['cactus_getWallets', 'cactus_getWallets'])).toThrow(
      'Duplicate dapp command: cactus_getWallets',
    );

    expect(() => classifyDappCommands(['cactus_unknownCommand', 'cactus_unknownCommand'])).toThrow(
      'Duplicate dapp command: cactus_unknownCommand',
    );
  });

  it('does not grant categories to unknown commands', () => {
    expect(classifyDappCommands(['cactus_deleteEverything', 'CACTUS_GETWALLETS', 'cactus_getWallets'])).toEqual({
      innocuous: ['cactus_getWallets'],
      balance: [],
      sign: [],
      notifications: [],
      spending: [],
      other: [],
    });
  });

  it('rejects lookalike commands instead of normalizing dapp input', () => {
    expect(() => classifyDappCommands([' cactus_getWallets'])).toThrow('Invalid dapp command:  cactus_getWallets');

    expect(() => classifyDappCommands(['cactus_getWallets '])).toThrow('Invalid dapp command: cactus_getWallets ');
  });

  it('rejects malformed command entries and missing command lists', () => {
    expect(() => classifyDappCommands([''])).toThrow('Invalid dapp command: ');

    expect(() => classifyDappCommands([null] as unknown as string[])).toThrow('Invalid dapp command: null');

    expect(() => classifyDappCommands([undefined] as unknown as string[])).toThrow('Invalid dapp command: undefined');

    expect(() => classifyDappCommands([0] as unknown as string[])).toThrow('Invalid dapp command: 0');

    expect(() => classifyDappCommands([false] as unknown as string[])).toThrow('Invalid dapp command: false');

    expect(() => classifyDappCommands([{ command: 'cactus_getWallets' }] as unknown as string[])).toThrow(
      'Invalid dapp command: [object Object]',
    );

    expect(() => classifyDappCommands([['cactus_showNotification']] as unknown as string[])).toThrow(
      'Invalid dapp command: cactus_showNotification',
    );

    expect(() => classifyDappCommands(null as unknown as string[])).toThrow('Invalid dapp commands.');
  });
});
