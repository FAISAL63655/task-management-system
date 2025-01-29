import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box
} from '@mui/material';
import { useNotifications } from '../context/NotificationContext';

const departments = [
  'تطوير البرمجيات',
  'التسويق',
  'الموارد البشرية',
  'المالية',
  'خدمة العملاء',
  'المبيعات'
];

const NotificationDialog = ({ open, onClose }) => {
  const { createNotification } = useNotifications();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    isGlobal: true,
    targetDepartment: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGlobalChange = (e) => {
    setFormData(prev => ({
      ...prev,
      isGlobal: e.target.checked,
      targetDepartment: e.target.checked ? '' : prev.targetDepartment
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createNotification(formData);
      onClose();
      setFormData({
        title: '',
        message: '',
        type: 'info',
        isGlobal: true,
        targetDepartment: ''
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>إنشاء إشعار جديد</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="title"
              label="عنوان الإشعار"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              name="message"
              label="نص الإشعار"
              value={formData.message}
              onChange={handleChange}
              required
              multiline
              rows={4}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>نوع الإشعار</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="نوع الإشعار"
              >
                <MenuItem value="info">معلومات</MenuItem>
                <MenuItem value="warning">تنبيه</MenuItem>
                <MenuItem value="success">نجاح</MenuItem>
                <MenuItem value="error">خطأ</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isGlobal}
                  onChange={handleGlobalChange}
                  name="isGlobal"
                />
              }
              label="إشعار عام لجميع الموظفين"
            />

            {!formData.isGlobal && (
              <FormControl fullWidth>
                <InputLabel>القسم المستهدف</InputLabel>
                <Select
                  name="targetDepartment"
                  value={formData.targetDepartment}
                  onChange={handleChange}
                  label="القسم المستهدف"
                  required={!formData.isGlobal}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>إلغاء</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            إرسال
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NotificationDialog;
