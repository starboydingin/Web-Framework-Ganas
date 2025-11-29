import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Plus, 
  Search, 
  Bell,
  User,
  LogOut,
  MoreVertical,
  Edit2,
  Trash2,
  Share2,
  Clock,
  Filter,
  Sun,
  Moon,
  X
} from 'lucide-react';
import Profile from '../Components/Profile';
import ShareTaskPage from './ShareTaskPage';

export default function Dashboard({ onNavigate, onLogout, currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [theme, setTheme] = useState('light');
  const [showProfile, setShowProfile] = useState(false);
  const [displayName, setDisplayName] = useState(
    localStorage.getItem('userName') || (currentUser ? currentUser.split('@')[0] : 'User')
  );
  const [notifications, setNotifications] = useState([]);
  const [sharingTaskId, setSharingTaskId] = useState(null);

  // Modal form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    reminderTime: '',
    priority: 'medium',
    completed: false
  });

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Initial mock data
      const mockTasks = [
        {
          id: '1',
          title: 'Submit assignment',
          description: 'Complete and submit the final project assignment',
          deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          reminderTime: '16:00',
          priority: 'high',
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Team meeting preparation',
          description: 'Prepare presentation slides for weekly team meeting',
          deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          reminderTime: '14:00',
          priority: 'medium',
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Review pull request',
          description: 'Review and approve the authentication feature PR',
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          reminderTime: '10:00',
          priority: 'low',
          completed: true,
          createdAt: new Date().toISOString()
        }
      ];
      setTasks(mockTasks);
      localStorage.setItem('tasks', JSON.stringify(mockTasks));
    }
    
    setTimeout(() => setIsLoading(false), 800);

    // Load notifications or create initial ones
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  // Generate notifications from tasks
  useEffect(() => {
    if (tasks.length > 0 && !isLoading) {
      const upcomingTasks = tasks.filter(task => {
        if (task.completed) return false;
        const deadline = new Date(task.deadline);
        const now = new Date();
        const diff = deadline.getTime() - now.getTime();
        const hours = diff / (1000 * 60 * 60);
        return hours <= 24 && hours > 0;
      }).map(task => ({
        id: task.id,
        title: task.title,
        message: `"${task.title}" is due ${getTimeRemaining(task.deadline)}`,
        time: new Date().toISOString(),
        read: false
      }));

      if (upcomingTasks.length > 0) {
        setNotifications(upcomingTasks);
        localStorage.setItem('notifications', JSON.stringify(upcomingTasks));
      }
    }
  }, [tasks, isLoading]);

  useEffect(() => {
    // Save tasks to localStorage whenever they change
    if (tasks.length > 0 || !isLoading) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoading]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleAddTask = (taskData) => {
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setTasks([newTask, ...tasks]);
    setIsModalOpen(false);
    resetForm();
  };

  const handleEditTask = (taskData) => {
    if (editingTask) {
      setTasks(tasks.map(t => 
        t.id === editingTask.id 
          ? { ...taskData, id: t.id, createdAt: t.createdAt }
          : t
      ));
      setEditingTask(null);
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    setOpenMenuId(null);
  };

  const handleToggleComplete = (id) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleShareTask = (taskId) => {
    setSharingTaskId(taskId);
    setOpenMenuId(null);
  };

  const handleClearNotification = (id) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== id);
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('notifications', JSON.stringify([]));
    setShowNotification(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      deadline: task.deadline.split('T')[0] + 'T' + task.deadline.split('T')[1].slice(0, 5),
      reminderTime: task.reminderTime,
      priority: task.priority,
      completed: task.completed
    });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const openAddModal = () => {
    setEditingTask(null);
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      deadline: '',
      reminderTime: '',
      priority: 'medium',
      completed: false
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTask) {
      handleEditTask(formData);
    } else {
      handleAddTask(formData);
    }
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    
    if (diff < 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Due in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Due in ${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Due soon';
  };

  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Status filter
    switch (activeFilter) {
      case 'pending':
        return !task.completed;
      case 'completed':
        return task.completed;
      case 'high':
        return task.priority === 'high';
      case 'deadline':
        const deadline = new Date(task.deadline);
        const now = new Date();
        const diff = deadline.getTime() - now.getTime();
        const hours = diff / (1000 * 60 * 60);
        return hours <= 24 && hours > 0;
      default:
        return true;
    }
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    high: tasks.filter(t => t.priority === 'high' && !t.completed).length
  };

  // Show ShareTask page if requested
  if (sharingTaskId) {
    return (
      <ShareTaskPage
        taskId={sharingTaskId}
        onBack={() => setSharingTaskId(null)}
      />
    );
  }

  // Show Profile page if requested
  if (showProfile) {
    return (
      <Profile
        currentUser={currentUser}
        onLogout={onLogout}
        onBack={() => {
          // Refresh display name from localStorage when coming back from profile
          const updatedName = localStorage.getItem('userName') || (currentUser ? currentUser.split('@')[0] : 'User');
          setDisplayName(updatedName);
          setShowProfile(false);
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#1A1A1A] flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4CAF50]/20 border-t-[#4CAF50] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#1A1A1A]/60 dark:text-white/60">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#F5F5F5] dark:from-[#0F0F0F] dark:to-[#1A1A1A] transition-colors">
      {/* Header */}
      <header className="border-b border-[#E8E8E8] dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-[#1A1A1A] dark:text-white hidden sm:block font-medium">Task Reminder System</span>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-[#1A1A1A]" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-300" />
                )}
              </button>

              <button
                onClick={() => setShowNotification(!showNotification)}
                className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#4CAF50] rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-[#4CAF50]/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-[#4CAF50]" />
                  </div>
                  <span className="text-[#1A1A1A] dark:text-white text-sm hidden md:block">
                    {displayName}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-lg border border-[#E8E8E8] dark:border-[#333] py-2">
                    <div className="px-4 py-2 border-b border-[#E8E8E8] dark:border-[#333]">
                      <p className="text-[#1A1A1A] dark:text-white text-sm truncate">{currentUser || 'user@example.com'}</p>
                      <p className="text-[#1A1A1A]/60 dark:text-white/60 text-xs">Free Plan</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfile(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[#1A1A1A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-white/10 flex items-center gap-2 text-sm"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={onLogout || (() => alert('Logout'))}
                      className="w-full px-4 py-2 text-left text-[#1A1A1A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-white/10 flex items-center gap-2 text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotification && (
        <div className="fixed top-20 right-4 z-50 w-96 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-2xl border border-[#E8E8E8] dark:border-[#333] animate-slide-in max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#E8E8E8] dark:border-[#333] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#4CAF50]" />
              <h3 className="text-[#1A1A1A] dark:text-white font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-[#4CAF50] text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="p-1 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-[#1A1A1A]/60 dark:text-white/60" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-[#F5F5F5] dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-8 h-8 text-[#1A1A1A]/20 dark:text-white/20" />
                </div>
                <p className="text-[#1A1A1A] dark:text-white font-medium mb-1">No notifications</p>
                <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E8E8E8] dark:divide-[#333]">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 hover:bg-[#F5F5F5] dark:hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#4CAF50]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-[#4CAF50]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[#1A1A1A] dark:text-white font-medium mb-1 truncate">
                          {notif.title}
                        </h4>
                        <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm mb-1">
                          {notif.message}
                        </p>
                        <p className="text-[#1A1A1A]/40 dark:text-white/40 text-xs">
                          {new Date(notif.time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleClearNotification(notif.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-600/10 rounded transition-all"
                      >
                        <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-[#E8E8E8] dark:border-[#333]">
              <button
                onClick={handleClearAllNotifications}
                className="w-full px-4 py-2 text-center text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded-lg transition-colors text-sm font-medium"
              >
                Clear All Notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-[#2A2A2A] rounded-xl p-4 border border-[#E8E8E8] dark:border-[#333] transition-colors">
            <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm mb-1">Total Tasks</p>
            <p className="text-[#1A1A1A] dark:text-white text-2xl font-semibold">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-[#2A2A2A] rounded-xl p-4 border border-[#E8E8E8] dark:border-[#333] transition-colors">
            <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm mb-1">Pending</p>
            <p className="text-[#1A1A1A] dark:text-white text-2xl font-semibold">{stats.pending}</p>
          </div>
          <div className="bg-white dark:bg-[#2A2A2A] rounded-xl p-4 border border-[#E8E8E8] dark:border-[#333] transition-colors">
            <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm mb-1">Completed</p>
            <p className="text-[#4CAF50] text-2xl font-semibold">{stats.completed}</p>
          </div>
          <div className="bg-white dark:bg-[#2A2A2A] rounded-xl p-4 border border-[#E8E8E8] dark:border-[#333] transition-colors">
            <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm mb-1">High Priority</p>
            <p className="text-red-500 text-2xl font-semibold">{stats.high}</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1A1A1A]/40 dark:text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#2A2A2A] border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/40 dark:placeholder:text-white/40 focus:outline-none focus:border-[#4CAF50] transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-[#4CAF50] text-white rounded-xl hover:bg-[#45a049] transition-all flex items-center gap-2 shadow-lg shadow-[#4CAF50]/20"
            >
              <Plus className="w-5 h-5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All Tasks', count: tasks.length },
            { key: 'pending', label: 'Pending', count: stats.pending },
            { key: 'completed', label: 'Completed', count: stats.completed },
            { key: 'high', label: 'High Priority', count: stats.high },
            { key: 'deadline', label: 'Deadline Soon', count: tasks.filter(t => {
              const deadline = new Date(t.deadline);
              const diff = deadline.getTime() - new Date().getTime();
              const hours = diff / (1000 * 60 * 60);
              return hours <= 24 && hours > 0;
            }).length }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                activeFilter === filter.key
                  ? 'bg-[#4CAF50] text-white shadow-lg shadow-[#4CAF50]/20'
                  : 'bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-white border border-[#E8E8E8] dark:border-[#333] hover:border-[#4CAF50]'
              }`}
            >
              {filter.label}
              <span className={`ml-2 ${activeFilter === filter.key ? 'text-white/80' : 'text-[#1A1A1A]/60 dark:text-white/60'}`}>
                ({filter.count})
              </span>
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-white dark:bg-[#2A2A2A] rounded-xl p-12 text-center border border-[#E8E8E8] dark:border-[#333] transition-colors">
              <div className="w-16 h-16 bg-[#F5F5F5] dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#1A1A1A]/20 dark:text-white/20" />
              </div>
              <p className="text-[#1A1A1A] dark:text-white mb-2 font-medium">No tasks found</p>
              <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm mb-6">
                {searchQuery ? 'Try adjusting your search' : 'Create your first task to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={openAddModal}
                  className="px-6 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-all"
                >
                  Add Task
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white dark:bg-[#2A2A2A] rounded-xl p-4 border border-[#E8E8E8] dark:border-[#333] hover:border-[#4CAF50]/50 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      task.completed
                        ? 'bg-[#4CAF50] border-[#4CAF50]'
                        : 'border-[#E8E8E8] dark:border-[#333] hover:border-[#4CAF50]'
                    }`}
                  >
                    {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-[#1A1A1A] dark:text-white mb-1 font-medium ${task.completed ? 'line-through opacity-50' : ''}`}>
                      {task.title}
                    </h3>
                    <p className={`text-[#1A1A1A]/60 dark:text-white/60 text-sm mb-3 ${task.completed ? 'line-through opacity-50' : ''}`}>
                      {task.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 text-[#1A1A1A]/60 dark:text-white/60 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{getTimeRemaining(task.deadline)}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs ${
                        task.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-600/20 dark:text-red-400' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-600/20 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-600 dark:bg-blue-600/20 dark:text-blue-300'
                      }`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      <span className="text-[#1A1A1A]/40 dark:text-white/40 text-xs">
                        {new Date(task.deadline).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                      className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
                    </button>

                    {openMenuId === task.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-lg border border-[#E8E8E8] dark:border-[#333] py-2 z-10">
                        <button
                          onClick={() => openEditModal(task)}
                          className="w-full px-4 py-2 text-left text-[#1A1A1A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-white/10 flex items-center gap-2 text-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleShareTask(task.id)}
                          className="w-full px-4 py-2 text-left text-[#1A1A1A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-white/10 flex items-center gap-2 text-sm"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-600/10 flex items-center gap-2 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add/Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#2A2A2A] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#1A1A1A] dark:text-white text-xl font-semibold">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingTask(null);
                  resetForm();
                }}
                className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task title"
                  required
                  className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-white/5 border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/40 dark:placeholder:text-white/40 focus:outline-none focus:border-[#4CAF50] transition-all"
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add task description"
                  rows="3"
                  className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-white/5 border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/40 dark:placeholder:text-white/40 focus:outline-none focus:border-[#4CAF50] transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                  Deadline *
                </label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-white/5 border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#4CAF50] transition-all"
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                  Reminder Time
                </label>
                <input
                  type="time"
                  value={formData.reminderTime}
                  onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-white/5 border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#4CAF50] transition-all"
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                  Priority *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority })}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        formData.priority === priority
                          ? priority === 'high' 
                            ? 'bg-red-500 text-white' 
                            : priority === 'medium' 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-blue-500 text-white'
                          : 'bg-[#F5F5F5] dark:bg-white/5 text-[#1A1A1A] dark:text-white border border-[#E8E8E8] dark:border-[#333]'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-[#F5F5F5] dark:bg-white/5 text-[#1A1A1A] dark:text-white border border-[#E8E8E8] dark:border-[#333] rounded-xl hover:bg-[#E8E8E8] dark:hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#4CAF50] text-white rounded-xl hover:bg-[#45a049] transition-all shadow-lg shadow-[#4CAF50]/20"
                >
                  {editingTask ? 'Update' : 'Create'} Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
