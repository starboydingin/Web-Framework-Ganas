import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  Copy,
  Link2,
  Eye,
  Edit3,
  Users,
  Check,
  Share2,
  Sun,
  Moon,
  Clock,
  X
} from 'lucide-react';

export default function ShareTaskPage({ taskId, onBack }) {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );
  const [task, setTask] = useState(null);
  const [permission, setPermission] = useState('view'); // 'view' or 'edit'
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [sharedWith, setSharedWith] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    // Load task data
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const foundTask = tasks.find(t => t.id === taskId);
    if (foundTask) {
      setTask(foundTask);
    }

    // Load shared data
    const sharedData = JSON.parse(localStorage.getItem('sharedTasks') || '{}');
    if (sharedData[taskId]) {
      setSharedWith(sharedData[taskId].sharedWith || []);
      setPermission(sharedData[taskId].permission || 'view');
    }

    // Generate share link
    generateShareLink(taskId, permission);
  }, [taskId]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const generateShareLink = (id, perm) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/shared/${id}?permission=${perm}`;
    setShareLink(link);
  };

  const handlePermissionChange = (newPermission) => {
    setPermission(newPermission);
    generateShareLink(taskId, newPermission);
    
    // Save permission to localStorage
    const sharedData = JSON.parse(localStorage.getItem('sharedTasks') || '{}');
    sharedData[taskId] = {
      ...sharedData[taskId],
      permission: newPermission,
      sharedWith: sharedWith
    };
    localStorage.setItem('sharedTasks', JSON.stringify(sharedData));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareViaEmail = () => {
    if (!emailInput.trim()) return;

    const newShare = {
      email: emailInput,
      permission: permission,
      sharedAt: new Date().toISOString()
    };

    const updatedSharedWith = [...sharedWith, newShare];
    setSharedWith(updatedSharedWith);

    // Save to localStorage
    const sharedData = JSON.parse(localStorage.getItem('sharedTasks') || '{}');
    sharedData[taskId] = {
      permission: permission,
      sharedWith: updatedSharedWith
    };
    localStorage.setItem('sharedTasks', JSON.stringify(sharedData));

    setEmailInput('');
    setShowShareModal(false);
  };

  const handleRemoveShare = (email) => {
    const updatedSharedWith = sharedWith.filter(s => s.email !== email);
    setSharedWith(updatedSharedWith);

    // Update localStorage
    const sharedData = JSON.parse(localStorage.getItem('sharedTasks') || '{}');
    sharedData[taskId] = {
      permission: permission,
      sharedWith: updatedSharedWith
    };
    localStorage.setItem('sharedTasks', JSON.stringify(sharedData));
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

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-[#F5F5F5] dark:from-[#0F0F0F] dark:to-[#1A1A1A] flex items-center justify-center">
        <p className="text-[#1A1A1A] dark:text-white">Task not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#F5F5F5] dark:from-[#0F0F0F] dark:to-[#1A1A1A] transition-colors">
      {/* Header */}
      <header className="border-b border-[#E8E8E8] dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-[#1A1A1A] dark:text-white hidden sm:block font-medium">
                  Share Task
                </span>
              </div>
            </div>

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Task Preview */}
        <div className="bg-white dark:bg-[#2A2A2A] rounded-2xl p-6 border border-[#E8E8E8] dark:border-[#333] mb-6 transition-colors">
          <div className="flex items-start gap-4">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
              task.completed
                ? 'bg-[#4CAF50] border-[#4CAF50]'
                : 'border-[#E8E8E8] dark:border-[#333]'
            }`}>
              {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
            </div>

            <div className="flex-1">
              <h2 className={`text-xl font-semibold text-[#1A1A1A] dark:text-white mb-2 ${task.completed ? 'line-through opacity-50' : ''}`}>
                {task.title}
              </h2>
              <p className={`text-[#1A1A1A]/60 dark:text-white/60 mb-3 ${task.completed ? 'line-through opacity-50' : ''}`}>
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
              </div>
            </div>
          </div>
        </div>

        {/* Permission Settings */}
        <div className="bg-white dark:bg-[#2A2A2A] rounded-2xl p-6 border border-[#E8E8E8] dark:border-[#333] mb-6 transition-colors">
          <h3 className="text-[#1A1A1A] dark:text-white font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Share Settings
          </h3>

          <div className="space-y-3">
            {/* View Only Option */}
            <button
              onClick={() => handlePermissionChange('view')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                permission === 'view'
                  ? 'border-[#4CAF50] bg-[#4CAF50]/5'
                  : 'border-[#E8E8E8] dark:border-[#333] hover:border-[#4CAF50]/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  permission === 'view' ? 'bg-[#4CAF50]/10' : 'bg-[#F5F5F5] dark:bg-white/5'
                }`}>
                  <Eye className={`w-5 h-5 ${permission === 'view' ? 'text-[#4CAF50]' : 'text-[#1A1A1A]/60 dark:text-white/60'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[#1A1A1A] dark:text-white font-medium">View Only</h4>
                    {permission === 'view' && (
                      <Check className="w-5 h-5 text-[#4CAF50]" />
                    )}
                  </div>
                  <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm">
                    People can only view the task details. They cannot make any changes.
                  </p>
                </div>
              </div>
            </button>

            {/* Can Edit Option */}
            <button
              onClick={() => handlePermissionChange('edit')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                permission === 'edit'
                  ? 'border-[#4CAF50] bg-[#4CAF50]/5'
                  : 'border-[#E8E8E8] dark:border-[#333] hover:border-[#4CAF50]/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  permission === 'edit' ? 'bg-[#4CAF50]/10' : 'bg-[#F5F5F5] dark:bg-white/5'
                }`}>
                  <Edit3 className={`w-5 h-5 ${permission === 'edit' ? 'text-[#4CAF50]' : 'text-[#1A1A1A]/60 dark:text-white/60'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[#1A1A1A] dark:text-white font-medium">Can Edit</h4>
                    {permission === 'edit' && (
                      <Check className="w-5 h-5 text-[#4CAF50]" />
                    )}
                  </div>
                  <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm">
                    People can view and edit the task. Perfect for team collaboration.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Share Link */}
        <div className="bg-white dark:bg-[#2A2A2A] rounded-2xl p-6 border border-[#E8E8E8] dark:border-[#333] mb-6 transition-colors">
          <h3 className="text-[#1A1A1A] dark:text-white font-semibold mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Share Link
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 px-4 py-3 bg-[#F5F5F5] dark:bg-white/5 border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white text-sm"
            />
            <button
              onClick={handleCopyLink}
              className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 ${
                copied
                  ? 'bg-[#4CAF50] text-white'
                  : 'bg-[#4CAF50] text-white hover:bg-[#45a049]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm mt-3">
            Anyone with this link can {permission === 'edit' ? 'view and edit' : 'view'} this task.
          </p>
        </div>

        {/* Share with Specific People */}
        <div className="bg-white dark:bg-[#2A2A2A] rounded-2xl p-6 border border-[#E8E8E8] dark:border-[#333] transition-colors">
          <h3 className="text-[#1A1A1A] dark:text-white font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Shared With
          </h3>

          <button
            onClick={() => setShowShareModal(true)}
            className="w-full px-4 py-3 border-2 border-dashed border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white hover:border-[#4CAF50] transition-all"
          >
            + Add people
          </button>

          {/* List of shared people */}
          {sharedWith.length > 0 && (
            <div className="mt-4 space-y-2">
              {sharedWith.map((share, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-[#F5F5F5] dark:bg-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#4CAF50]/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#4CAF50]" />
                    </div>
                    <div>
                      <p className="text-[#1A1A1A] dark:text-white text-sm font-medium">
                        {share.email}
                      </p>
                      <p className="text-[#1A1A1A]/60 dark:text-white/60 text-xs">
                        {share.permission === 'edit' ? 'Can edit' : 'Can view'} • Shared{' '}
                        {new Date(share.sharedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveShare(share.email)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-600/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#2A2A2A] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#1A1A1A] dark:text-white text-xl font-semibold">
                Share with people
              </h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[#1A1A1A] dark:text-white text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-white/5 border border-[#E8E8E8] dark:border-[#333] rounded-xl text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/40 dark:placeholder:text-white/40 focus:outline-none focus:border-[#4CAF50] transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-6 py-3 bg-[#F5F5F5] dark:bg-white/5 text-[#1A1A1A] dark:text-white border border-[#E8E8E8] dark:border-[#333] rounded-xl hover:bg-[#E8E8E8] dark:hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareViaEmail}
                  disabled={!emailInput.trim()}
                  className="flex-1 px-6 py-3 bg-[#4CAF50] text-white rounded-xl hover:bg-[#45a049] transition-all shadow-lg shadow-[#4CAF50]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
