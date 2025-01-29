import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    delayedTasks: 0
  });
  const [employeeStats, setEmployeeStats] = useState([]);
  const [tasksByPriority, setTasksByPriority] = useState([]);
  const [tasksTrend, setTasksTrend] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const endDate = new Date();
      let startDate;

      switch (filterPeriod) {
        case 'week':
          startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = startOfMonth(endDate);
          break;
        case 'year':
          startDate = subMonths(endDate, 12);
          break;
        default:
          startDate = startOfMonth(endDate);
      }

      // Fetch tasks
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          department: selectedDepartment !== 'all' ? selectedDepartment : undefined
        }
      });

      const tasks = response.data.tasks;

      // Calculate basic stats
      const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(task => task.status === 'completed').length,
        pendingTasks: tasks.filter(task => task.status === 'pending').length,
        delayedTasks: tasks.filter(task => task.status === 'delayed').length,
        inProgressTasks: tasks.filter(task => task.status === 'in-progress').length
      };

      // Calculate tasks by priority
      const priorityStats = [
        { name: 'عالية', value: tasks.filter(task => task.priority === 'high').length },
        { name: 'متوسطة', value: tasks.filter(task => task.priority === 'medium').length },
        { name: 'منخفضة', value: tasks.filter(task => task.priority === 'low').length }
      ];

      // Calculate employee performance
      const employeeMap = new Map();
      tasks.forEach(task => {
        if (task.assignedTo) {
          task.assignedTo.forEach(user => {
            if (!employeeMap.has(user._id)) {
              employeeMap.set(user._id, {
                name: user.name,
                total: 0,
                completed: 0
              });
            }
            const stats = employeeMap.get(user._id);
            stats.total++;
            if (task.status === 'completed') {
              stats.completed++;
            }
          });
        }
      });

      const employeeStats = Array.from(employeeMap.values()).map(stat => ({
        ...stat,
        completionRate: (stat.completed / stat.total) * 100
      }));

      // Calculate tasks trend
      const tasksByDate = new Map();
      tasks.forEach(task => {
        const date = format(new Date(task.createdAt), 'yyyy-MM-dd');
        if (!tasksByDate.has(date)) {
          tasksByDate.set(date, { date, total: 0, completed: 0 });
        }
        const dateStats = tasksByDate.get(date);
        dateStats.total++;
        if (task.status === 'completed') {
          dateStats.completed++;
        }
      });

      const tasksTrend = Array.from(tasksByDate.values())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(stat => ({
          ...stat,
          date: format(new Date(stat.date), 'dd/MM', { locale: ar })
        }));

      setStats(stats);
      setTasksByPriority(priorityStats);
      setEmployeeStats(employeeStats);
      setTasksTrend(tasksTrend);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterPeriod, selectedDepartment]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="right">
          لوحة التحكم
        </Typography>
        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>الفترة الزمنية</InputLabel>
              <Select
                value={filterPeriod}
                label="الفترة الزمنية"
                onChange={(e) => setFilterPeriod(e.target.value)}
              >
                <MenuItem value="week">أسبوع</MenuItem>
                <MenuItem value="month">شهر</MenuItem>
                <MenuItem value="year">سنة</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>القسم</InputLabel>
              <Select
                value={selectedDepartment}
                label="القسم"
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <MenuItem value="all">جميع الأقسام</MenuItem>
                <MenuItem value="تطوير البرمجيات">تطوير البرمجيات</MenuItem>
                <MenuItem value="التسويق">التسويق</MenuItem>
                <MenuItem value="الموارد البشرية">الموارد البشرية</MenuItem>
                <MenuItem value="المالية">المالية</MenuItem>
                <MenuItem value="خدمة العملاء">خدمة العملاء</MenuItem>
                <MenuItem value="المبيعات">المبيعات</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#e3f2fd' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              إجمالي المهام
            </Typography>
            <Typography component="p" variant="h4">
              {stats.totalTasks}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#e8f5e9' }}>
            <Typography component="h2" variant="h6" color="success" gutterBottom>
              المهام المكتملة
            </Typography>
            <Typography component="p" variant="h4">
              {stats.completedTasks}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#fff3e0' }}>
            <Typography component="h2" variant="h6" color="warning" gutterBottom>
              المهام قيد التنفيذ
            </Typography>
            <Typography component="p" variant="h4">
              {stats.inProgressTasks}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#ffebee' }}>
            <Typography component="h2" variant="h6" color="error" gutterBottom>
              المهام المتأخرة
            </Typography>
            <Typography component="p" variant="h4">
              {stats.delayedTasks}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Tasks by Priority */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom align="right">
              توزيع المهام حسب الأولوية
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tasksByPriority}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {tasksByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Employee Performance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom align="right">
              أداء الموظفين
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completionRate" name="نسبة الإنجاز %" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Tasks Trend */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom align="right">
              تطور المهام
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tasksTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" name="إجمالي المهام" stroke="#8884d8" />
                <Line type="monotone" dataKey="completed" name="المهام المكتملة" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
