import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LogOut, BarChart3, LayoutDashboard,
  User, Lock, Loader2, Save, Briefcase
} from 'lucide-react';
import { updateProfile, changePassword } from '../services/userApi';
import DarkModeToggle from '../components/DarkModeToggle';
import { CalendarDays } from 'lucide-react';
import OnboardingTour from '../components/OnboardingTour';
import GlobalSearchModal from '../components/GlobalSearchModal';
import { Search, Menu } from 'lucide-react';
import { HelpCircle } from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('user'));

  const [username, setUsername] = useState(storedUser?.username || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const user = JSON.parse(localStorage.getItem('user'));
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  if (!storedUser) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileErrors({});

    if (username.trim().length < 2) {
      setProfileErrors({ username: 'Tên người dùng phải từ 2 ký tự trở lên' });
      return;
    }

    setSavingProfile(true);
    try {
      const res = await updateProfile(storedUser.id, { username });
      // Cập nhật lại localStorage để header các trang khác hiển thị đúng tên mới
      const updatedUser = { ...storedUser, username: res.data.username };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Đã cập nhật thông tin');
    } catch (err) {
      if (err.fieldErrors) setProfileErrors(err.fieldErrors);
      toast.error(err.friendlyMessage);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordErrors({});

    if (newPassword.length < 6) {
      setPasswordErrors({ newPassword: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(storedUser.id, { currentPassword, newPassword });
      toast.success('Đã đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err.fieldErrors) setPasswordErrors(err.fieldErrors);
      toast.error(err.friendlyMessage);
    } finally {
      setSavingPassword(false);
    }
  };

  const initial = storedUser?.username?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
              {initial}
            </div>
            <div>
              <p className="text-sm text-gray-400 dark:text-gray-500 leading-none">Xin chào</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">{storedUser?.username}</p>
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
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950"
              >
                <Briefcase className="w-4 h-4" />
                Kanban
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
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950"
              >
                <LayoutDashboard className="w-4 h-4" />
                Tasks
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
                      onClick={() => { navigate('/jobs'); setShowMobileMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Briefcase className="w-4 h-4" />
                      Kanban
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
                      onClick={() => { navigate('/dashboard'); setShowMobileMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Tasks
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

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Hồ sơ cá nhân</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Quản lý thông tin tài khoản của bạn</p>
        </div>

        {/* Card Avatar */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shrink-0">
            {initial}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{storedUser.username}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{storedUser.email}</p>
          </div>
        </div>

        {/* Form đổi tên */}
        <form
          onSubmit={handleUpdateProfile}
          className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Thông tin cá nhân</h3>
          </div>

          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
            Tên người dùng
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition dark:bg-gray-700 dark:text-gray-100 ${
              profileErrors.username
                ? 'border-red-300 dark:border-red-700 focus:ring-red-400'
                : 'border-gray-200 dark:border-gray-600 focus:ring-indigo-500'
            }`}
          />
          {profileErrors.username && (
            <p className="text-xs text-red-500 mt-1">{profileErrors.username}</p>
          )}

          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block mt-4">
            Email
          </label>
          <input
            type="email"
            value={storedUser.email}
            disabled
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Email không thể thay đổi</p>

          <button
            type="submit"
            disabled={savingProfile}
            className="mt-4 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu thay đổi
          </button>
        </form>

        {/* Form đổi mật khẩu */}
        <form
          onSubmit={handleChangePassword}
          className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Đổi mật khẩu</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition dark:bg-gray-700 dark:text-gray-100 ${
                  passwordErrors.currentPassword
                    ? 'border-red-300 dark:border-red-700 focus:ring-red-400'
                    : 'border-gray-200 dark:border-gray-600 focus:ring-indigo-500'
                }`}
              />
              {passwordErrors.currentPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition dark:bg-gray-700 dark:text-gray-100 ${
                  passwordErrors.newPassword
                    ? 'border-red-300 dark:border-red-700 focus:ring-red-400'
                    : 'border-gray-200 dark:border-gray-600 focus:ring-indigo-500'
                }`}
              />
              {passwordErrors.newPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition dark:bg-gray-700 dark:text-gray-100 ${
                  passwordErrors.confirmPassword
                    ? 'border-red-300 dark:border-red-700 focus:ring-red-400'
                    : 'border-gray-200 dark:border-gray-600 focus:ring-indigo-500'
                }`}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="mt-4 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Đổi mật khẩu
          </button>
        </form>
      </main>
      <GlobalSearchModal
        open={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        userId={user?.id}
      />
      {showOnboarding && <OnboardingTour onClose={() => setShowOnboarding(false)} />}
    </div>
  );
}

export default Profile;