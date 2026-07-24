import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths,
} from 'date-fns';
import {
  LogOut, Briefcase, LayoutDashboard, BarChart3, UserCircle,
  ChevronLeft, ChevronRight, Loader2, Building2, MessageSquare,
} from 'lucide-react';
import { getJobApplications, getInterviewNotesByUser } from '../services/jobApi';
import DarkModeToggle from '../components/DarkModeToggle';
import OnboardingTour from '../components/OnboardingTour';
import GlobalSearchModal from '../components/GlobalSearchModal';
import { Search, Menu } from 'lucide-react';
import { HelpCircle } from 'lucide-react';

function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [jobs, setJobs] = useState([]);
  const [interviewNotes, setInterviewNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const [jobsRes, notesRes] = await Promise.all([
          getJobApplications(user.id),
          getInterviewNotesByUser(user.id),
        ]);
        setJobs(jobsRes.data);
        setInterviewNotes(notesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Gom deadline và phỏng vấn theo ngày (dạng "yyyy-MM-dd")
  const eventsByDate = {};
  jobs.forEach((job) => {
    if (job.deadline) {
      if (!eventsByDate[job.deadline]) eventsByDate[job.deadline] = [];
      eventsByDate[job.deadline].push({ type: 'deadline', job });
    }
  });
  interviewNotes.forEach((note) => {
    const job = jobs.find((j) => j.id === note.jobApplicationId);
    if (note.interviewDate && job) {
      if (!eventsByDate[note.interviewDate]) eventsByDate[note.interviewDate] = [];
      eventsByDate[note.interviewDate].push({ type: 'interview', job, note });
    }
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const today = new Date();
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const selectedEvents = selectedDay ? eventsByDate[format(selectedDay, 'yyyy-MM-dd')] || [] : [];

  const initial = user?.username?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm shrink-0">
              {initial}
            </div>
            <div className="hidden sm:block">
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
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950"
              >
                <Briefcase className="w-4 h-4" />
                Kanban
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
                      onClick={() => { navigate('/profile'); setShowMobileMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <UserCircle className="w-4 h-4" />
                      Hồ sơ
                    </button>
                    <button
                      onClick={() => { navigate('/jobs'); setShowMobileMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Briefcase className="w-4 h-4" />
                      Kanban
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Hôm nay
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Lưới lịch */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
                {weekDays.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {days.map((day) => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dayEvents = eventsByDate[dateKey] || [];
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, today);
                  const isSelected = selectedDay && isSameDay(day, selectedDay);

                  return (
                    <button
                      key={dateKey}
                      onClick={() => setSelectedDay(day)}
                      className={`min-h-[70px] sm:min-h-[90px] p-1.5 border-b border-r border-gray-50 dark:border-gray-700/50 text-left transition ${
                        isSelected ? 'bg-indigo-50 dark:bg-indigo-950' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <span
                        className={`text-xs inline-flex items-center justify-center w-5 h-5 rounded-full ${
                          isToday
                            ? 'bg-indigo-600 text-white font-semibold'
                            : isCurrentMonth
                            ? 'text-gray-700 dark:text-gray-300'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 2).map((ev, i) => (
                          <div
                            key={i}
                            className={`text-[10px] px-1 py-0.5 rounded truncate ${
                              ev.type === 'deadline'
                                ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {ev.job.company}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[10px] text-gray-400 dark:text-gray-500 px-1">
                            +{dayEvents.length - 2} khác
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chi tiết ngày được chọn */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {selectedDay ? format(selectedDay, 'dd/MM/yyyy') : 'Chọn 1 ngày để xem chi tiết'}
              </h3>

              {!selectedDay ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                  Bấm vào 1 ngày trên lịch để xem deadline hoặc lịch phỏng vấn.
                </p>
              ) : selectedEvents.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                  Không có sự kiện nào trong ngày này.
                </p>
              ) : (
                <ul className="space-y-2">
                  {selectedEvents.map((ev, i) => (
                    <li
                      key={i}
                      className={`p-3 rounded-lg border ${
                        ev.type === 'deadline'
                          ? 'border-red-100 dark:border-red-900 bg-red-50/50 dark:bg-red-950/30'
                          : 'border-amber-100 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {ev.type === 'deadline' ? (
                          <Building2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        ) : (
                          <MessageSquare className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {ev.type === 'deadline' ? 'Deadline' : 'Phỏng vấn'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{ev.job.company}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{ev.job.position}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
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

export default CalendarView;