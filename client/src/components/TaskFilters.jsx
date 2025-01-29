import {
  Box,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ar } from 'date-fns/locale';

const TaskFilters = ({ filters, onFilterChange }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="بحث"
            name="search"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="البحث في العنوان أو الوصف"
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>الحالة</InputLabel>
            <Select
              value={filters.status}
              label="الحالة"
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="pending">قيد الانتظار</MenuItem>
              <MenuItem value="in-progress">قيد التنفيذ</MenuItem>
              <MenuItem value="completed">مكتملة</MenuItem>
              <MenuItem value="delayed">متأخرة</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>الأولوية</InputLabel>
            <Select
              value={filters.priority}
              label="الأولوية"
              onChange={(e) => onFilterChange('priority', e.target.value)}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="high">عالية</MenuItem>
              <MenuItem value="medium">متوسطة</MenuItem>
              <MenuItem value="low">منخفضة</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>القسم</InputLabel>
            <Select
              value={filters.department}
              label="القسم"
              onChange={(e) => onFilterChange('department', e.target.value)}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="تطوير البرمجيات">تطوير البرمجيات</MenuItem>
              <MenuItem value="التسويق">التسويق</MenuItem>
              <MenuItem value="الموارد البشرية">الموارد البشرية</MenuItem>
              <MenuItem value="المالية">المالية</MenuItem>
              <MenuItem value="خدمة العملاء">خدمة العملاء</MenuItem>
              <MenuItem value="المبيعات">المبيعات</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
            <DatePicker
              label="تاريخ الاستحقاق"
              value={filters.dueDate}
              onChange={(date) => onFilterChange('dueDate', date)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskFilters;
