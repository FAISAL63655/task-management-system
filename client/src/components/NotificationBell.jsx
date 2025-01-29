import { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
  const { isAdmin } = useAuth();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };

  const handleDelete = (event, notificationId) => {
    event.stopPropagation();
    deleteNotification(notificationId);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: '80vh',
            width: '350px',
            direction: 'rtl'
          }
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem>
            <ListItemText primary="لا توجد إشعارات" />
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <div key={notification._id}>
              <MenuItem
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  backgroundColor: notification.isRead ? 'inherit' : 'action.hover',
                  display: 'block'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="subtitle2" color="primary">
                    {notification.title}
                  </Typography>
                  {isAdmin && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleDelete(e, notification._id)}
                      sx={{ mr: -1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {notification.message}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(notification.createdAt)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.createdBy.name}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
            </div>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
