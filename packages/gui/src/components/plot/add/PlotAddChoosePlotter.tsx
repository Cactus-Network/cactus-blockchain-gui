import { defaultPlotter, PlotterName } from '@cactus-network/api';
import type { Plotter, PlotterMap } from '@cactus-network/api';
import { useGetPlottersQuery } from '@cactus-network/api-react';
import { CardStep, Select, StateColor } from '@cactus-network/core';
import { t, Trans } from '@lingui/macro';
import { FormControl, FormHelperText, Grid, InputLabel, MenuItem, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import styled from 'styled-components';

type Props = {
  step: number;
  onChange: (plotter: PlotterName) => void;
};

const StyledFormHelperText = styled(FormHelperText)`
  color: ${StateColor.WARNING};
`;

export default function PlotAddChoosePlotter(props: Props) {
  const { step, onChange } = props;
  const plotterName: PlotterName | undefined = useWatch({ name: 'plotterName' });
  const { data: plotters } = useGetPlottersQuery();

  function getDisplayablePlotters(p: PlotterMap<PlotterName, Plotter>): PlotterName[] {
    const displayablePlotters = Object.keys(p) as PlotterName[];
    // Sort cactuspos to the top of the list
    displayablePlotters.sort((a, b) => (a === PlotterName.CACTUSPOS ? -1 : a.localeCompare(b)));
    return displayablePlotters;
  }

  const displayedPlotters = useMemo(() => (plotters ? getDisplayablePlotters(plotters) : []), [plotters]);

  const handleChange = async (event: any) => {
    const selectedPlotterName: PlotterName = event.target.value as PlotterName;
    onChange(selectedPlotterName);
  };

  const isPlotterInstalled = (name: PlotterName): boolean => {
    const installed = plotters[name]?.installInfo?.installed ?? false;
    return installed;
  };

  const isPlotterSupported = (name: PlotterName): boolean => {
    const installed = plotters[name]?.installInfo?.installed ?? false;
    const supported = installed || (plotters[name]?.installInfo?.canInstall ?? false);
    return supported;
  };

  function plotterDisplayName(name: PlotterName): string {
    const plotter = plotters[name] ?? defaultPlotter;
    const { version } = plotter;
    const installed = plotter.installInfo?.installed ?? false;
    let { displayName } = plotter;

    if (version) {
      displayName += ` ${version}`;
    }

    if (!isPlotterSupported(name)) {
      displayName += ` ${t`(Not Supported)`}`;
    } else if (!installed) {
      displayName += ` ${t`(Not Installed)`}`;
    }

    return displayName;
  }

  const plotterWarningString = (name: PlotterName | undefined): string | undefined => {
    if (name !== PlotterName.BLADEBIT_RAM) {
      return undefined;
    }
    const msg = plotters[PlotterName.BLADEBIT_RAM]?.installInfo?.bladebitMemoryWarning;
    if (!msg) {
      return undefined;
    }
    const regex = /BladeBit requires at least (?<ram>\d*[.]?\d+) GiB of RAM to operate/;
    const m = regex.exec(msg);
    if (!m || !m.groups || !m.groups.ram) {
      return t`Insufficient RAM for BladeBit`;
    }
    return t`BladeBit requires at least ${m.groups.ram} GiB of RAM to operate`;
  };

  const warning = plotterWarningString(plotterName);

  return (
    <CardStep step={step} title={<Trans>Choose Plotter</Trans>}>
      <Typography variant="subtitle1">
        <Trans>
          Depending on your system configuration, you may find that an alternative plotter produces plots faster than
          the default Cactus Proof of Space plotter. If unsure, use the default Cactus Proof of Space plotter.
        </Trans>
      </Typography>

      <Grid container>
        <Grid xs={12} sm={10} md={8} lg={6} item>
          <FormControl variant="filled" fullWidth>
            <InputLabel required focused>
              <Trans>Plotter</Trans>
            </InputLabel>
            <Select name="plotterName" onChange={handleChange} value={plotterName}>
              {displayedPlotters.map((plotter) => (
                <MenuItem
                  value={plotter}
                  key={plotter}
                  disabled={!isPlotterInstalled(plotter) || !isPlotterSupported(plotter)}
                >
                  {plotterDisplayName(plotter)}
                </MenuItem>
              ))}
            </Select>
            {warning && <StyledFormHelperText>{warning}</StyledFormHelperText>}
          </FormControl>
        </Grid>
      </Grid>
    </CardStep>
  );
}
