import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Plus, Filter } from 'lucide-react';
import TaskForm from '../components/TaskForm';
import { toast } from 'sonner';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all'
  });

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, filters]);

  const loadTasks = async () => {
    try {
      const response = await axios.get(`${API}/tasks`);
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(t => t.priority === filters.priority);
    }

    // Sort: overdue first, then by due date
    filtered.sort((a, b) => {
      const today = new Date().toISOString().split('T')[0];
      const aOverdue = a.due_date < today && a.status !== 'Completed';
      const bOverdue = b.due_date < today && b.status !== 'Completed';
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      return new Date(a.due_date) - new Date(b.due_date);
    });

    setFilteredTasks(filtered);
  };

  const handleTaskCreated = () => {
    setShowForm(false);
    setSelectedTask(null);
    loadTasks();
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await axios.put(`${API}/tasks/${taskId}`, {
        ...task,
        status: 'Completed'
      });
      toast.success('Task completed!');
      loadTasks();
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-700';
      case 'High':
        return 'bg-orange-100 text-orange-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Blocked':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const isOverdue = (dueDate, status) => {
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today && status !== 'Completed';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="spinner"></div></div>;
  }

  const overdueTasks = filteredTasks.filter(t => isOverdue(t.due_date, t.status));
  const dueTodayTasks = filteredTasks.filter(t => t.due_date === new Date().toISOString().split('T')[0] && t.status !== 'Completed');
  const upcomingTasks = filteredTasks.filter(t => t.due_date > new Date().toISOString().split('T')[0] && t.status !== 'Completed');
  const completedTasks = filteredTasks.filter(t => t.status === 'Completed');

  return (
    <div className="px-6 py-8 space-y-6" data-testid="task-list-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Tasks</h1>
          <p className="text-slate-600">{filteredTasks.length} total tasks</p>
        </div>
        <Button
          onClick={() => { setSelectedTask(null); setShowForm(true); }}
          className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
          data-testid="add-task-button"
        >
          <Plus size={18} />
          <span>Create Task</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="text-2xl font-bold text-red-700">{overdueTasks.length}</div>
          <div className="text-sm text-red-600">Overdue</div>
        </Card>
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="text-2xl font-bold text-orange-700">{dueTodayTasks.length}</div>
          <div className="text-sm text-orange-600">Due Today</div>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{upcomingTasks.length}</div>
          <div className="text-sm text-blue-600">Upcoming</div>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="text-2xl font-bold text-green-700">{completedTasks.length}</div>
          <div className="text-sm text-green-600">Completed</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              data-testid="filter-status"
            >
              <option value="all">All Status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Blocked">Blocked</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              data-testid="filter-priority"
            >
              <option value="all">All Priority</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <Button
            variant="outline"
            onClick={() => setFilters({ status: 'all', priority: 'all' })}
            className="flex items-center space-x-2"
          >
            <Filter size={18} />
            <span>Clear Filters</span>
          </Button>
        </div>
      </Card>

      {/* Task Groups */}
      <div className="space-y-6">
        {overdueTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-red-700 mb-3">Overdue ({overdueTasks.length})</h2>
            <div className="space-y-3">
              {overdueTasks.map(task => (
                <Card key={task.id} className="p-4 bg-red-50 border-red-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={getPriorityClass(task.priority)}>{task.priority}</Badge>
                        <Badge className={getStatusClass(task.status)}>{task.status}</Badge>
                        <span className="text-sm font-medium text-slate-800">{task.task_type}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">{task.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{task.customer_name}</p>
                      {task.description && (
                        <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        <span>Assigned to: {task.assigned_to_name}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {task.status !== 'Completed' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteTask(task.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTask(task)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {dueTodayTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-orange-700 mb-3">Due Today ({dueTodayTasks.length})</h2>
            <div className="space-y-3">
              {dueTodayTasks.map(task => (
                <Card key={task.id} className="p-4 bg-white border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={getPriorityClass(task.priority)}>{task.priority}</Badge>
                        <Badge className={getStatusClass(task.status)}>{task.status}</Badge>
                        <span className="text-sm font-medium text-slate-800">{task.task_type}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">{task.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{task.customer_name}</p>
                      {task.description && (
                        <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span>Assigned to: {task.assigned_to_name}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {task.status !== 'Completed' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteTask(task.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTask(task)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {upcomingTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-3">Upcoming ({upcomingTasks.length})</h2>
            <div className="space-y-3">
              {upcomingTasks.slice(0, 10).map(task => (
                <Card key={task.id} className="p-4 bg-white border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={getPriorityClass(task.priority)}>{task.priority}</Badge>
                        <Badge className={getStatusClass(task.status)}>{task.status}</Badge>
                        <span className="text-sm font-medium text-slate-800">{task.task_type}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">{task.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{task.customer_name}</p>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        <span>Assigned to: {task.assigned_to_name}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {task.status !== 'Completed' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteTask(task.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTask(task)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <TaskForm
          task={selectedTask}
          onClose={() => { setShowForm(false); setSelectedTask(null); }}
          onSuccess={handleTaskCreated}
        />
      )}
    </div>
  );
}
