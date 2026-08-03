import { Flex, LayoutDashboardSub } from '@cactus-network/core';
import { Trans } from '@lingui/macro';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Grid, Typography, Card, CardContent, CardActionArea, IconButton } from '@mui/material';
import React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import LogViewerCard from './logViewer/LogViewerCard';

function ToolsIndex() {
  const navigate = useNavigate();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardActionArea onClick={() => navigate('/dashboard/cactustools/logs')}>
            <CardContent>
              <Flex flexDirection="column" gap={1} alignItems="center">
                <AssessmentIcon sx={{ fontSize: '4rem' }} color="primary" />
                <Typography variant="h6" align="center">
                  <Trans>Log Viewer</Trans>
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                  <Trans>View and analyze Cactus log files</Trans>
                </Typography>
              </Flex>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    </Grid>
  );
}

export default function CactusToolsPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isToolActive = pathname !== '/dashboard/cactustools';

  const handleBack = () => {
    navigate('/dashboard/cactustools', { replace: true });
  };

  return (
    <LayoutDashboardSub>
      <Flex flexDirection="column" gap={3}>
        <Flex gap={1} alignItems="center">
          {isToolActive && (
            <IconButton onClick={handleBack} size="large">
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h5">
            <Trans>{isToolActive ? 'Log Viewer' : 'Tools'}</Trans>
          </Typography>
        </Flex>
        <Routes>
          <Route index element={<ToolsIndex />} />
          <Route path="logs" element={<LogViewerCard />} />
        </Routes>
      </Flex>
    </LayoutDashboardSub>
  );
}
