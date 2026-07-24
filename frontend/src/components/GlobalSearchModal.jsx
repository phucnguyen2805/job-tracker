import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Building2, ListTodo, Loader2 } from 'lucide-react';
import api from '../services/api';
import { getJobApplications } from '../services/jobApi';

function GlobalSearchModal({ open, onClose, userId }) {
  const [keyword, setKeyword] = useState('');
  const [jobs, setJobs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, tasksRes] = await Promise.all([
        getJobApplications(userId),
        api.get(`/tasks/user/${userId}`),
      ]);
      setJobs(jobsRes.data);
      setTasks(tasksRes.data);
      setLoaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    if (open && !loaded) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
    }
    if (open) {
      setKeyword('');
    }
  }, [open]);

  if (!open) return null;

  const kw = keyword.trim().toLowerCase();

  const matchedJobs = kw
    ? jobs.filter(
        (j) =>
          j.company?.toLowerCase().includes(kw) ||
          j.position?.toLowerCase().includes(kw)
      )
    : [];

  const matchedTasks = kw
    ? tasks.filter((t) => t.title?.toLowerCase().includes(kw))
    : [];

  const hasResults = matchedJobs.length > 0 || matchedTasks.length > 0;

  const handleJobClick = () => {
    navigate('/jobs');
    onClose();
  };

  const handleTaskClick = () => {
    navigate('/dashboard');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-[70] p-4 pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Tìm công ty, vị trí, hoặc công việc..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
          ) : !kw ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
              Gõ từ khóa để tìm kiếm trong đơn ứng tuyển và công việc của bạn.
            </p>
          ) : !hasResults ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
              Không tìm thấy kết quả nào cho "{keyword}".
            </p>
          ) : (
            <>
              {matchedJobs.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 px-3 py-1.5">
                    Đơn ứng tuyển ({matchedJobs.length})
                  </p>
                  {matchedJobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={handleJobClick}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left transition"
                    >
                      <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{job.company}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{job.position}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {matchedTasks.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 px-3 py-1.5">
                    Công việc ({matchedTasks.length})
                  </p>
                  {matchedTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={handleTaskClick}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left transition"
                    >
                      <ListTodo className="w-4 h-4 text-emerald-500 shrink-0" />
                      <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{task.title}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default GlobalSearchModal;