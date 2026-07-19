import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  LogOut, LayoutDashboard, Briefcase, Loader2,
  TrendingUp, CheckCircle2, XCircle, Clock, BarChart3,
} from 'lucide-react';
import { getJobApplications } from '../services/jobApi';
import DarkModeToggle from '../components/DarkModeToggle';
import { UserCircle } from 'lucide-react';

const STATUS_META = {
  APPLIED: { label: 'Đã ứng tuyển', color: '#9CA3AF' },
  INTERVIEWING: { label: 'Đang phỏng vấn', color: '#F59E0B' },
  OFFER: { label: 'Nhận offer', color: '#10B981' },
  REJECTED: { label: 'Bị từ chối', color: '#EF4444' },
};

function Statistics() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchJobs = async () => {
      try {
        const res = await getJobApplications(user.id);
        setJobs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const total = jobs.length;
  const countByStatus = (status) => jobs.filter((j) => j.status === status).length;

  const pieData = Object.keys(STATUS_META)
    .map((key) => ({
      name: STATUS_META[key].label,
      value: countByStatus(key),
      color: STATUS_META[key].color,
    }))
    .filter((d) => d.value > 0);

  const responded = countByStatus('INTERVIEWING') + countByStatus('OFFER') + countByStatus('REJECTED');
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
  const successRate = total > 0 ? Math.round((countByStatus('OFFER') / total) * 100) : 0;

  const monthlyMap = {};
  jobs.forEach((job) => {
    if (!job.appliedDate) return;
    const month = job.appliedDate.slice(0, 7);
    monthlyMap[month] = (monthlyMap[month] || 0) + 1;
  });
  const monthlyData = Object.keys(monthlyMap)
    .sort()
    .map((month) => ({ month, count: monthlyMap[month] }));

  const initial = user?.username?.charAt(0)?.toUpperCase() || '?';

  const statCards = [
    { label: 'Tổng đơn ứng tuyển', value: total, icon: Briefcase, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950' },
    { label: 'Đang phỏng vấn', value: countByStatus('INTERVIEWING'), icon: Clock, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950' },
    { label: 'Nhận offer', value: countByStatus('OFFER'), icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950' },
    { label: 'Bị từ chối', value: countByStatus('REJECTED'), icon: XCircle, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
              {initial}
            </div>
            <div>
              <p className="text-sm text-gray-400 dark:text-gray-500 leading-none">Xin chào</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">{user?.username}</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <DarkModeToggle />
            <button
              onClick={() => navigate('/jobs')}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950"
            >
              <Briefcase className="w-4 h-4" />
              Kanban
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950"
            >
              <LayoutDashboard className="w-4 h-4" />
              Tasks
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950"
            >
              <UserCircle className="w-4 h-4" />
              Hồ sơ
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Thống kê ứng tuyển
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tổng quan quá trình tìm việc của bạn</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
          </div>
        ) : total === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <Briefcase className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Chưa có dữ liệu để thống kê. Thêm đơn ứng tuyển trước nhé!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tỷ lệ phản hồi</p>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{responseRate}%</p>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-3">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${responseRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{responded}/{total} đơn đã có phản hồi</p>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tỷ lệ nhận offer</p>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{successRate}%</p>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-3">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${successRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{countByStatus('OFFER')}/{total} đơn nhận offer</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Phân bố theo trạng thái</p>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Số đơn ứng tuyển theo tháng</p>
                {monthlyData.length === 0 ? (
                  <div className="flex items-center justify-center h-[260px] text-sm text-gray-400 dark:text-gray-500">
                    Chưa có ngày ứng tuyển để thống kê
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Statistics;