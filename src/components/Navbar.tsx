import React, { ReactNode, useState } from 'react';
import { AppBar as MuiAppBar, Toolbar, Typography, Button, CssBaseline, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';

const drawerWidth = 240;

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginLeft: 0, // Removed margin to account for the absence of the side navbar
}));

interface AppBarProps extends React.ComponentProps<typeof MuiAppBar> {}

const AppBar = styled(MuiAppBar)<AppBarProps>(({ theme }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  width: '100%', // Set width to 100% since there's no drawer
  marginLeft: 0, // Reset margin to 0
}));

const Navbar: React.FC = () => {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Event Planning System
        </Typography>
        <Button color="inherit" component={Link} to="/">Dashboard</Button>
        <Button color="inherit" component={Link} to="/calendar">Calendar</Button>
        <Button color="inherit" component={Link} to="/group-management">Group Management</Button>
      </Toolbar>
    </AppBar>
  );
};

// Define the props type for AppLayout
interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Navbar />
      <Main sx={{ mt: 8 }}>
        {children}
      </Main>
    </Box>
  );
};

export default AppLayout;
