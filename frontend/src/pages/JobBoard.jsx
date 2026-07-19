import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Plus, LogOut, Building2, Calendar, X, Loader2, Trash2, LayoutDashboard, Search, ArrowUpDown, BarChart3, AlertTriangle, Bell } from 'lucide-react';
import {
  getJobApplications,
  createJobApplication,
  updateJobStatus,
  deleteJobApplication,
} from '../services/jobApi';
import JobDetailModal from '../components/JobDetailModal';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import DarkModeToggle from '../components/DarkModeToggle';
import { UserCircle } from 'lucide-react';
import TagInput from '../components/TagInput';
import { ChevronDown, Phone, Mail, User as UserIcon } from 'lucide-react';

const COLUMNS = [
  { id: 'APPLIED', title: 'Đã ứng tuyển', color: 'border-t-gray-400' },
  { id: 'INTERVIEWING', title: 'Đang phỏng vấn', color: 'border-t-amber-400' },
  { id: 'OFFER', title: 'Nhận offer', color: 'border-t-emerald-400' },
  { id: 'REJECTED', title: 'Bị từ chối', color: 'border-t-red-400' },
];

function isOverdue(deadline) {
  if (!deadline) return false;
  return new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString();
}

function isUpcoming(deadline) {
  if (!deadline) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(deadline);
  const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 3;
}

// --- Card kéo được ---
function JobCard({ job, onDelete, onView }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 'auto',
  };

  const overdue = isOverdue(job.deadline);
  const upcoming = !overdue && isUpcoming(job.deadline);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onView(job)}
      className={`bg-gray-50 dark:bg-gray-700 border rounded-lg p-3 group relative cursor-pointer active:cursor-grabbing touch-none ${
        isDragging
          ? 'shadow-lg ring-2 ring-indigo-300 opacity-90 border-gray-100 dark:border-gray-600'
          : overdue
          ? 'border-red-200 dark:border-red-800 ring-1 ring-red-100 dark:ring-red-900'
          : upcoming
          ? 'border-amber-200 dark:border-amber-800 ring-1 ring-amber-100 dark:ring-amber-900'
          : 'border-gray-100 dark:border-gray-600'
      }`}
    >
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(job.id);
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-500 hover:text-red-500 transition"
      >
        <Trash2 className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-1.5 text-gray-900 dark:text-gray-100 font-medium text-sm pr-7">
        <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
        <span className="truncate">{job.company}</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{job.position}</p>
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {job.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {job.deadline && (
        <div
          className={`flex items-center gap-1 text-xs mt-2 ${
            overdue
              ? 'text-red-500 dark:text-red-400 font-medium'
              : upcoming
              ? 'text-amber-600 dark:text-amber-400 font-medium'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          {job.deadline}
          {overdue && ' (quá hạn)'}
          {upcoming && ' (sắp đến hạn)'}
        </div>
      )}
    </div>
  );
}

// --- Cột thả vào được ---
function Column({ col, jobs, onDelete, onView }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border-t-4 ${col.color} shadow-sm flex flex-col`}>
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">{col.title}</h3>
        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
          {jobs.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 p-2 space-y-2 min-h-[120px] transition rounded-b-xl ${
          isOver ? 'bg-indigo-50 dark:bg-indigo-950' : ''
        }`}
      >
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onDelete={onDelete} onView={onView} />
        ))}
      </div>
    </div>
  );
}

function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('deadline');
  const [showReminders, setShowReminders] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [viewingJob, setViewingJob] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [tags, setTags] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

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

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createJobApplication({
        company,
        position,
        status: 'APPLIED',
        appliedDate,
        deadline,
        notes,
        userId: user.id,
        contactName,
        contactEmail,
        contactPhone,
        tags,
      });
      setCompany('');
      setPosition('');
      setAppliedDate('');
      setDeadline('');
      setNotes('');
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setTags([]);
      setShowAdvanced(false);
      setShowForm(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
      toast.error(err.friendlyMessage || 'Có lỗi xảy ra, thử lại nhé.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      await deleteJobApplication(confirmDeleteId);
      fetchJobs();
      toast.success('Đã xóa đơn ứng tuyển');
    } catch (err) {
      console.error(err);
      toast.error('Không thể xóa, thử lại nhé');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const jobId = active.id;
    const newStatus = over.id;
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status === newStatus) return;

    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );

    try {
      await updateJobStatus(jobId, newStatus);
    } catch (err) {
      console.error(err);
      fetchJobs();
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const keyword = searchTerm.toLowerCase();
    return (
      job.company?.toLowerCase().includes(keyword) ||
      job.position?.toLowerCase().includes(keyword)
    );
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'company') {
      return (a.company || '').localeCompare(b.company || '');
    }
    if (sortBy === 'appliedDate') {
      return new Date(b.appliedDate || 0) - new Date(a.appliedDate || 0);
    }
    if (sortBy === 'deadline') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    }
    return 0;
  });

  const overdueJobs = jobs.filter((j) => isOverdue(j.deadline) && j.status !== 'REJECTED');
  const upcomingJobs = jobs.filter((j) => isUpcoming(j.deadline) && j.status !== 'REJECTED');

  const initial = user?.username?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {showReminders && (overdueJobs.length > 0 || upcomingJobs.length > 0) && (
          <div className="mb-6 space-y-2">
            {overdueJobs.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    {overdueJobs.length} đơn đã quá hạn
                  </p>
                  <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                    {overdueJobs.map((j) => j.company).join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => setShowReminders(false)}
                  className="text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {upcomingJobs.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                <Bell className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    {upcomingJobs.length} đơn sắp đến hạn trong 3 ngày tới
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    {upcomingJobs.map((j) => `${j.company} (${j.deadline})`).join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => setShowReminders(false)}
                  className="text-amber-400 dark:text-amber-500 hover:text-amber-600 dark:hover:text-amber-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Theo dõi ứng tuyển</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? `${sortedJobs.length}/${jobs.length}` : jobs.length} đơn ứng tuyển • Kéo thả để đổi trạng thái
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Đóng' : 'Thêm đơn ứng tuyển'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mb-6 p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Tên công ty"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              placeholder="Vị trí ứng tuyển"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Ngày ứng tuyển</label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Deadline / Lịch phỏng vấn</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <textarea
              placeholder="Ghi chú (nguồn tuyển, người liên hệ...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-2"
              rows={2}
            />

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 font-medium"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                Thông tin liên hệ & nhãn (tùy chọn)
              </button>
            </div>

            {showAdvanced && (
              <>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tên người liên hệ"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Số điện thoại"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="relative md:col-span-2">
                  <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="Email người liên hệ"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <TagInput tags={tags} onChange={setTags} />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="md:col-span-2 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Thêm đơn ứng tuyển'}
            </button>
          </form>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo công ty hoặc vị trí..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>

          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 dark:text-gray-100 appearance-none cursor-pointer"
            >
              <option value="deadline">Deadline gần nhất</option>
              <option value="appliedDate">Ngày ứng tuyển mới nhất</option>
              <option value="company">Tên công ty A-Z</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {COLUMNS.map((col) => (
                <Column
                  key={col.id}
                  col={col}
                  jobs={sortedJobs.filter((j) => j.status === col.id)}
                  onDelete={handleDeleteClick}
                  onView={setViewingJob}
                />
              ))}
            </div>
          </DndContext>
        )}
      </main>

      {viewingJob && (
        <JobDetailModal
          job={viewingJob}
          userId={user.id}
          onClose={() => setViewingJob(null)}
        />
      )}

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Xóa đơn ứng tuyển"
        message="Hành động này không thể hoàn tác. Tất cả công việc liên quan cũng sẽ mất."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}

export default JobBoard;