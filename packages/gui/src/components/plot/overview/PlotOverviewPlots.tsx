import { useRefreshPlotsMutation, useGetPlotDirectoriesQuery } from '@cactus-network/api-react';
import { Button, Flex, useOpenDialog, MenuItem, More } from '@cactus-network/core';
import { Trans } from '@lingui/macro';
import { Folder, Refresh } from '@mui/icons-material';
import { ListItemIcon, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router';

import PlotAddDirectoryDialog from '../PlotAddDirectoryDialog';
import PlotHarvesters from '../PlotHarvesters';
import PlotPlotting from '../PlotPlotting';

import PlotOverviewCards from './PlotOverviewCards';

export default function PlotOverviewPlots() {
  const navigate = useNavigate();
  const openDialog = useOpenDialog();
  const { data: directories, isLoading } = useGetPlotDirectoriesQuery();
  const [refreshPlots] = useRefreshPlotsMutation();

  function handleAddPlot() {
    navigate('/dashboard/plot/add');
  }

  function handleAddPlotDirectory() {
    openDialog(<PlotAddDirectoryDialog />);
  }

  async function handleRefreshPlots() {
    await refreshPlots().unwrap();
  }

  return (
    <Flex flexDirection="column" gap={4}>
      <Flex flexDirection="column" gap={2}>
        <Flex flexGrow={1} justifyContent="space-between">
          <Typography variant="h5">
            <Trans>Plotting Manager</Trans>
          </Typography>
          <Flex alignItems="center">
            <Button variant="outlined" color="primary" onClick={handleAddPlot}>
              <Trans>+ Add a Plot</Trans>
            </Button>
            &nbsp;
            <More>
              <MenuItem onClick={handleAddPlotDirectory} close>
                <ListItemIcon>
                  <Folder fontSize="small" color="info" />
                </ListItemIcon>
                <Typography variant="inherit" noWrap>
                  {isLoading || !directories || directories.length === 0 ? (
                    <Trans>Add Plot Directory</Trans>
                  ) : (
                    <Trans>Manage Plot Directories</Trans>
                  )}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleRefreshPlots} close>
                <ListItemIcon>
                  <Refresh fontSize="small" color="info" />
                </ListItemIcon>
                <Typography variant="inherit" noWrap>
                  <Trans>Refresh Plots</Trans>
                </Typography>
              </MenuItem>
            </More>
          </Flex>
        </Flex>
        <PlotOverviewCards />
      </Flex>
      <PlotPlotting />
      <PlotHarvesters />
    </Flex>
  );
}
