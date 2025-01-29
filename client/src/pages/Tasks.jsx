import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Menu,
  Tooltip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';

const priorities = {
  high: { label: 'عالية', color: 'error' },
  medium: { label: 'متوسطة', color: 'warning' },
  low: { label: 'منخفضة', color: 'info' }
};

const statuses = {
  pending: { label: 'قيد الانتظار', color: 'warning' },
  'in-progress': { label: 'قيد التنفيذ', color: 'info' },
  completed: { label: 'مكتملة', color: 'success' },
  delayed: { label: 'متأخرة', color: 'error' }
};

const departments = [
  'تطوير البرمجيات',
  'التسويق',
  'الموارد البشرية',
  'المالية',
  'خدمة العملاء',
  'المبيعات'
];
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import TaskFilters from '../components/TaskFilters';

const Tasks = () => {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    department: 'all',
    dueDate: null
  });
  const [sorting, setSorting] = useState({
    field: 'dueDate',
    direction: 'asc'
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    assignedTo: [],
    assignedDepartment: '',
    assignmentType: 'employees'
  });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data.tasks);
      applyFiltersAndSort(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
    fetchTasks();
  }, [isAdmin]);

  const applyFiltersAndSort = (taskList = tasks) => {
    let filtered = [...taskList];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.department !== 'all') {
      filtered = filtered.filter(task => 
        task.assignedDepartment === filters.department ||
        task.assignedTo.some(user => user.department === filters.department)
      );
    }

    if (filters.dueDate) {
      const filterDate = new Date(filters.dueDate).setHours(0, 0, 0, 0);
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.dueDate).setHours(0, 0, 0, 0);
        return taskDate === filterDate;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sorting.field) {
        case 'dueDate':
          comparison = new Date(a.dueDate) - new Date(b.dueDate);
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = a[sorting.field].localeCompare(b[sorting.field]);
      }
      return sorting.direction === 'asc' ? comparison : -comparison;
    });

    setFilteredTasks(filtered);
  };

  useEffect(() => {
    applyFiltersAndSort();
  }, [filters, sorting, tasks]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSort = (field) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleOpenDialog = (task = null) => {
    if (task) {
      setSelectedTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate.split('T')[0],
        assignedTo: task.assignedTo?.map(user => user._id) || [],
        assignedDepartment: task.assignedDepartment || '',
        assignmentType: task.assignedDepartment ? 'department' : 'employees'
      });
    } else {
      setSelectedTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        dueDate: '',
        assignedTo: [],
        assignedDepartment: '',
        assignmentType: 'employees'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
        assignedTo: formData.assignmentType === 'employees' ? formData.assignedTo : [],
        assignedDepartment: formData.assignmentType === 'department' ? formData.assignedDepartment : ''
      };

      if (selectedTask) {
        await axios.put(
          `http://localhost:5000/api/tasks/${selectedTask._id}`,
          submitData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        await axios.post('http://localhost:5000/api/tasks', submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchTasks();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/tasks/${taskId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          المهام
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            مهمة جديدة
          </Button>
        )}
      </Box>

      <TaskFilters filters={filters} onFilterChange={handleFilterChange} />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="right">
                <TableSortLabel
                  active={sorting.field === 'title'}
                  direction={sorting.direction}
                  onClick={() => handleSort('title')}
                >
                  العنوان
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">الوصف</TableCell>
              <TableCell align="right">المكلف بالمهمة</TableCell>
              <TableCell align="right">القسم</TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sorting.field === 'priority'}
                  direction={sorting.direction}
                  onClick={() => handleSort('priority')}
                >
                  الأولوية
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sorting.field === 'status'}
                  direction={sorting.direction}
                  onClick={() => handleSort('status')}
                >
                  الحالة
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sorting.field === 'dueDate'}
                  direction={sorting.direction}
                  onClick={() => handleSort('dueDate')}
                >
                  تاريخ الاستحقاق
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell align="right">{task.title}</TableCell>
                <TableCell align="right">{task.description}</TableCell>
                <TableCell align="right">
                  {task.assignedDepartment ? (
                    <Chip label={`قسم ${task.assignedDepartment}`} color="primary" />
                  ) : (
                    task.assignedTo.map(user => user.name).join(', ')
                  )}
                </TableCell>
                <TableCell align="right">
                  {task.assignedDepartment || task.assignedTo[0]?.department}
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={priorities[task.priority].label}
                    color={priorities[task.priority].color}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={statuses[task.status].label}
                    color={statuses[task.status].color}
                    size="small"
                    onClick={() => !isAdmin && handleStatusChange(task._id, 'completed')}
                  />
                </TableCell>
                <TableCell align="right">
                  {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                </TableCell>
                <TableCell align="right">
                  {isAdmin && (
                    <>
                      <IconButton onClick={() => handleOpenDialog(task)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(task._id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTask ? 'تعديل المهمة' : 'مهمة جديدة'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              label="العنوان"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="الوصف"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={4}
              margin="normal"
            />
            <TextField
              select
              label="الأولوية"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              fullWidth
              margin="normal"
            >
              {Object.entries(priorities).map(([value, { label }]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="الحالة"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              fullWidth
              margin="normal"
            >
              {Object.entries(statuses).map(([value, { label }]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>

            {isAdmin && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">تعيين المهمة إلى:</FormLabel>
                  <RadioGroup
                    value={formData.assignmentType}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        assignmentType: e.target.value,
                        assignedTo: [],
                        assignedDepartment: ''
                      });
                    }}
                  >
                    <FormControlLabel 
                      value="employees" 
                      control={<Radio />} 
                      label="موظفين محددين" 
                    />
                    <FormControlLabel 
                      value="department" 
                      control={<Radio />} 
                      label="قسم كامل" 
                    />
                  </RadioGroup>
                </FormControl>

                {formData.assignmentType === 'employees' ? (
                  <TextField
                    select
                    label="اختيار الموظفين"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    fullWidth
                    SelectProps={{
                      multiple: true
                    }}
                    margin="normal"
                    required
                  >
                    {users.filter(u => u.role === 'employee').map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.name} - {user.department}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <TextField
                    select
                    label="اختيار القسم"
                    value={formData.assignedDepartment}
                    onChange={(e) => setFormData({ ...formData, assignedDepartment: e.target.value })}
                    fullWidth
                    margin="normal"
                    required
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Box>
            )}

            <TextField
              label="تاريخ الاستحقاق"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              fullWidth
              margin="normal"
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>إلغاء</Button>
            <Button type="submit" variant="contained">
              {selectedTask ? 'تحديث' : 'إنشاء'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Tasks;
