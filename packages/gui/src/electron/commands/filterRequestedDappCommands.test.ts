import { filterRequestedDappCommands } from './filterRequestedDappCommands';

describe('filterRequestedDappCommands', () => {
  it('allows known dapp commands and rejects unknown commands without changing request order', () => {
    expect(
      filterRequestedDappCommands([
        'cactus_unknownCommand',
        'cactus_logIn',
        'cactus_requestPermissions',
        'cactus_getPublicKey',
        'cactus_transferDID',
        'cactus_deleteEverything',
      ]),
    ).toEqual({
      allowed: ['cactus_requestPermissions', 'cactus_getPublicKey', 'cactus_transferDID'],
      rejected: ['cactus_unknownCommand', 'cactus_logIn', 'cactus_deleteEverything'],
    });
  });

  it('deduplicates commands before classifying them', () => {
    expect(
      filterRequestedDappCommands([
        'cactus_logIn',
        'cactus_logIn',
        'cactus_unknownCommand',
        'cactus_unknownCommand',
        'cactus_getPublicKey',
      ]),
    ).toEqual({
      allowed: ['cactus_getPublicKey'],
      rejected: ['cactus_logIn', 'cactus_unknownCommand'],
    });
  });

  it('ignores malformed non-string and empty command entries', () => {
    expect(
      filterRequestedDappCommands([
        '',
        null,
        undefined,
        0,
        false,
        { command: 'cactus_logIn' },
        ['cactus_getPublicKey'],
        'cactus_getPublicKey',
      ] as unknown as string[]),
    ).toEqual({
      allowed: ['cactus_getPublicKey'],
      rejected: [],
    });
  });

  it('rejects lookalike commands instead of normalizing dapp input', () => {
    expect(
      filterRequestedDappCommands([
        ' cactus_getPublicKey',
        'cactus_getPublicKey ',
        'CACTUS_GETPUBLICKEY',
        'cactus_getPublicKey',
      ]),
    ).toEqual({
      allowed: ['cactus_getPublicKey'],
      rejected: [' cactus_getPublicKey', 'cactus_getPublicKey ', 'CACTUS_GETPUBLICKEY'],
    });
  });

  it('rejects missing or non-array command lists', () => {
    expect(() => filterRequestedDappCommands(null as unknown as string[])).toThrow('Invalid dapp commands.');

    expect(() => filterRequestedDappCommands({ 0: 'cactus_logIn', length: 1 } as unknown as string[])).toThrow(
      'Invalid dapp commands.',
    );
  });
});
