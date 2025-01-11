import defaultsForPlotter from '../utils/defaultsForPlotter';
import optionsForPlotter from '../utils/optionsForPlotter';

import PlotterName from './PlotterName';

export default {
  displayName: 'Cactus Proof of Space',
  options: optionsForPlotter(PlotterName.CACTUSPOS),
  defaults: defaultsForPlotter(PlotterName.CACTUSPOS),
  installInfo: { installed: true },
};
