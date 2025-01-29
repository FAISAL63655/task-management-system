import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { Menu as MenuIcon, Dashboard, Assignment, ExitToApp, People, NotificationsActive } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import NotificationDialog from './NotificationDialog';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

  return (
    <AppBar position="static" sx={{ direction: 'rtl' }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ ml: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          نظام إدارة المهام
        </Typography>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAdmin && (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/dashboard"
                  startIcon={<Dashboard />}
                >
                  لوحة التحكم
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/users"
                  startIcon={<People />}
                >
                  إدارة الموظفين
                </Button>
              </>
            )}
            
            <Button
              color="inherit"
              component={Link}
              to="/tasks"
              startIcon={<Assignment />}
            >
              المهام
            </Button>

            {isAdmin && (
              <Button
                color="inherit"
                startIcon={<NotificationsActive />}
                onClick={() => setNotificationDialogOpen(true)}
              >
                إشعار جديد
              </Button>
            )}
            
            <NotificationBell />
            
            <Typography variant="body1">
              {user.name}
            </Typography>

            <Button
              color="inherit"
              startIcon={<ExitToApp />}
              onClick={logout}
            >
              تسجيل الخروج
            </Button>
          </Box>
        )}

        {!user && (
          <Box>
            <Button
              color="inherit"
              onClick={() => navigate('/login')}
            >
              تسجيل الدخول
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate('/register')}
            >
              تسجيل جديد
            </Button>
          </Box>
        )}
      </Toolbar>

      <NotificationDialog
        open={notificationDialogOpen}
        onClose={() => setNotificationDialogOpen(false)}
      />
    </AppBar>
  );
};

export default Navbar;
