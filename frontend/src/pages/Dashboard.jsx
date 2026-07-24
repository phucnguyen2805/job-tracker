import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, LogOut, Pencil, Trash2, X, Loader2,
  CheckCircle2, Circle, Clock, Bell, ClipboardList, Briefcase, BarChart3
} from 'lucide-react';
import api from '../services/api';
import socket from '../services/socket';
import ConfirmModal from '../components/ConfirmModal';
import DarkModeToggle from '../components/DarkModeToggle';
import { UserCircle } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { CalendarDays } from 'lucide-react';
import OnboardingTour from '../components/OnboardingTour';
import GlobalSearchModal from '../components/GlobalSearchModal';
import { Search, Menu } from 'lucide-react';
import { HelpCircle } from 'lucide-react';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/user/${user.id}`);
      setTasks(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();

    socket.emit('join', user.id);
    socket.on('notification', (data) => {
      setNotification(data.message);
      setTimeout(() => setNotification(''), 4000);
    });

    return () => {
      socket.off('notification');
    };
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('TODO');
    setEditingTask(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, { title, description, status, userId: user.id });
      } else {
        await api.post('/tasks', { title, description, status, userId: user.id });
        fetch(`${import.meta.env.VITE_SOCKET_URL}/api/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            message: `Bạn vừa tạo công việc mới: ${title}`,
          }),
        }).catch(() => {});
      }
      resetForm();
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra, thử lại nhé.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/tasks/${confirmDeleteId}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const statusConfig = {
    TODO: { label: 'Cần làm', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300', icon: Circle },
    IN_PROGRESS: { label: 'Đang làm', color: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400', icon: Clock },
    DONE: { label: 'Hoàn thành', color: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 },
  };

  const initial = user?.username?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
              {initial}
            </div>
            <div>
              <p className="text-sm text-gray-400 dark:text-gray-500 leading-none">Xin chào</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">{user?.username}</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setShowGlobalSearch(true)}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950"
            >
              <Search className="w-4 h-4" />
            </button>
            <DarkModeToggle />
            <button
              onClick={() => setShowOnboarding(true)}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Nav đầy đủ - chỉ hiện trên màn hình từ sm trở lên */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950"
              >
                <UserCircle className="w-4 h-4" />
                Hồ sơ
              </button>
              <button
                onClick={() => navigate('/calendar')}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950"
              >
                <CalendarDays className="w-4 h-4" />
                Lịch
              </button>
              <button
                onClick={() => navigate('/statistics')}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950"
              >
                <BarChart3 className="w-4 h-4" />
                Thống kê
              </button>
              <button
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950"
              >
                <Briefcase className="w-4 h-4" />
                Kanban
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>

            {/* Nút menu - chỉ hiện trên mobile */}
            <div className="relative sm:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex items-center p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu className="w-4 h-4" />
              </button>

              {showMobileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowMobileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg z-40 overflow-hidden">
                    <button
                      onClick={() => { navigate('/profile'); setShowMobileMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <UserCircle className="w-4 h-4" />
                      Hồ sơ
                    </button>
                    <button
                      onClick={() => { navigate('/calendar'); setShowMobileMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <CalendarDays className="w-4 h-4" />
                      Lịch
                    </button>
                    <button
                      onClick={() => { navigate('/statistics'); setShowMobileMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Thống kê
                    </button>
                    <button
                      onClick={() => { navigate('/jobs'); setShowMobileMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Briefcase className="w-4 h-4" />
                      Kanban
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Notification toast */}
      {notification && (
        <div className="max-w-3xl mx-auto px-6 pt-4">
          <div className="bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 text-sm animate-pulse">
            <Bell className="w-4 h-4" />
            {notification}
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Công việc của bạn</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tasks.length} công việc</p>
          </div>
          <button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Đóng' : 'Thêm công việc'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm space-y-3">
            <input
              type="text"
              placeholder="Tiêu đề công việc"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <textarea
              placeholder="Mô tả chi tiết (không bắt buộc)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TODO">Cần làm</option>
              <option value="IN_PROGRESS">Đang làm</option>
              <option value="DONE">Hoàn thành</option>
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingTask ? 'Cập nhật' : 'Tạo công việc'}
            </button>
          </form>
        )}

        {loading ? (
          <ul className="space-y-2.5">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </li>
            ))}
          </ul>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <ClipboardList className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Chưa có công việc nào. Bắt đầu tạo công việc đầu tiên nhé!</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {tasks.map((task) => {
              const cfg = statusConfig[task.status] || statusConfig.TODO;
              const StatusIcon = cfg.icon;
              return (
                <li
                  key={task.id}
                  className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex justify-between items-start gap-4 hover:shadow-sm transition"
                >
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{task.description}</p>
                    )}
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full mt-2 ${cfg.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(task.id)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Xóa công việc"
        message="Bạn có chắc muốn xóa công việc này không?"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
      <GlobalSearchModal
        open={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        userId={user?.id}
      />
      {showOnboarding && <OnboardingTour onClose={() => setShowOnboarding(false)} />}
    </div>
  );
}

export default Dashboard;