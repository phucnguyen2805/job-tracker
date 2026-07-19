import { useEffect, useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, Circle, Building2, Calendar, Loader2, Phone, Mail, User as UserIcon, Tag } from 'lucide-react';
import { getTasksByJob, createTask, updateTask, deleteTask } from '../services/taskApi';
import ConfirmModal from './ConfirmModal';

const STATUS_LABEL = {
  APPLIED: 'Đã ứng tuyển',
  INTERVIEWING: 'Đang phỏng vấn',
  OFFER: 'Nhận offer',
  REJECTED: 'Bị từ chối',
};

function JobDetailModal({ job, userId, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await getTasksByJob(job.id);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await createTask({
        title: newTitle,
        description: '',
        status: 'TODO',
        jobApplicationId: job.id,
        userId,
      });
      setNewTitle('');
      fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const toggleDone = async (task) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    try {
      await updateTask(task.id, { ...task, status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteTask = async () => {
    try {
      await deleteTask(confirmDeleteId);
      fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const doneCount = tasks.filter((t) => t.status === 'DONE').length;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-bold text-lg">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {job.company}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{job.position}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full font-medium">
                {STATUS_LABEL[job.status] || job.status}
              </span>
              {job.deadline && (
                <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {job.deadline}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notes */}
        {job.notes && (
          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">{job.notes}</p>
          </div>
        )}

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Nhãn</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Thông tin liên hệ */}
        {(job.contactName || job.contactEmail || job.contactPhone) && (
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 space-y-1.5">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Người liên hệ</p>
            {job.contactName && (
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <UserIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                {job.contactName}
              </div>
            )}
            {job.contactPhone && (
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                {job.contactPhone}
              </div>
            )}
            {job.contactEmail && (
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                {job.contactEmail}
              </div>
            )}
          </div>
        )}

        {/* Task list */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Công việc cần làm</h4>
            {tasks.length > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">{doneCount}/{tasks.length} hoàn thành</span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
              Chưa có công việc nào cho đơn ứng tuyển này.
            </p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-2 p-2.5 border border-gray-100 dark:border-gray-700 rounded-lg group"
                >
                  <button onClick={() => toggleDone(task)} className="shrink-0">
                    {task.status === 'DONE' ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                    ) : (
                      <Circle className="w-4.5 h-4.5 text-gray-300 dark:text-gray-600" />
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      task.status === 'DONE' ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {task.title}
                  </span>
                  <button
                    onClick={() => setConfirmDeleteId(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-500 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add task form */}
        <form onSubmit={handleAddTask} className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
          <input
            type="text"
            placeholder="Thêm công việc mới..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={adding}
            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </form>
      </div>

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Xóa công việc"
        message="Bạn có chắc muốn xóa công việc này không?"
        onConfirm={confirmDeleteTask}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}

export default JobDetailModal;