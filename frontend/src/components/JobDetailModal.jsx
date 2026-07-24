import { useEffect, useState } from 'react';
import {
  X, Plus, Trash2, CheckCircle2, Circle, Building2, Calendar, Loader2,
  Phone, Mail, User as UserIcon, Tag, History, ListTodo, ArrowRight,
  Sparkles, RefreshCw, MessageSquare, Star,
} from 'lucide-react';
import { getTasksByJob, createTask, updateTask, deleteTask } from '../services/taskApi';
import {
  getJobActivity, generateMockInterview,
  getInterviewNotes, createInterviewNote, deleteInterviewNote,
} from '../services/jobApi';
import ConfirmModal from './ConfirmModal';
import { FileText, Upload, ExternalLink } from 'lucide-react';
import { uploadResume, deleteResume } from '../services/jobApi';

const STATUS_LABEL = {
  APPLIED: 'Đã ứng tuyển',
  INTERVIEWING: 'Đang phỏng vấn',
  OFFER: 'Nhận offer',
  REJECTED: 'Bị từ chối',
};

function formatTimestamp(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition"
        >
          <Star
            className={`w-5 h-5 ${
              star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function JobDetailModal({ job, userId, onClose }) {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'timeline' | 'ai' | 'interviews'

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [activity, setActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [activityLoaded, setActivityLoaded] = useState(false);

  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState('');

  const [interviewNotes, setInterviewNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [rating, setRating] = useState(3);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [confirmDeleteNoteId, setConfirmDeleteNoteId] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(job.resumeUrl || null);
  const [resumeFileName, setResumeFileName] = useState(job.resumeFileName || null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [confirmDeleteResume, setConfirmDeleteResume] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await getTasksByJob(job.id);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await getJobActivity(job.id);
      setActivity(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActivity(false);
      setActivityLoaded(true);
    }
  };

  const fetchInterviewNotes = async () => {
    try {
      const res = await getInterviewNotes(job.id);
      setInterviewNotes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotes(false);
      setNotesLoaded(true);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, []);

  useEffect(() => {
    if (activeTab === 'timeline' && !activityLoaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchActivity();
    }
    if (activeTab === 'interviews' && !notesLoaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchInterviewNotes();
    }
  }, [activeTab]);
  

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

  const handleGenerateAi = async () => {
    setGeneratingAi(true);
    setAiError('');
    try {
      const res = await generateMockInterview(job.id, jobDescription);
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error(err);
      setAiError(err.friendlyMessage || 'Không thể tạo câu hỏi lúc này, thử lại sau nhé.');
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!interviewDate) return;
    setSavingNote(true);
    try {
      await createInterviewNote({
        jobApplicationId: job.id,
        interviewDate,
        rating,
        notes: noteText,
      });
      setInterviewDate('');
      setRating(3);
      setNoteText('');
      setShowNoteForm(false);
      fetchInterviewNotes();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleUploadResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File quá lớn, vui lòng chọn file dưới 5MB');
      return;
    }

    setUploadingResume(true);
    try {
      const res = await uploadResume(job.id, file);
      setResumeUrl(res.data.resumeUrl);
      setResumeFileName(res.data.resumeFileName);
    } catch (err) {
      console.error(err);
      alert('Không thể tải lên CV, thử lại nhé.');
    } finally {
      setUploadingResume(false);
      e.target.value = ''; // reset input để chọn lại cùng file nếu cần
    }
  };

  const confirmDeleteResumeAction = async () => {
    try {
      await deleteResume(job.id);
      setResumeUrl(null);
      setResumeFileName(null);
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmDeleteResume(false);
    }
  };

  const confirmDeleteNote = async () => {
    try {
      await deleteInterviewNote(confirmDeleteNoteId);
      fetchInterviewNotes();
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmDeleteNoteId(null);
    }
  };

  const doneCount = tasks.filter((t) => t.status === 'DONE').length;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div className="bg-white dark:bg-gray-800 sm:rounded-2xl rounded-t-2xl shadow-2xl w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col">
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

        {/* CV / Resume */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">CV / Hồ sơ</p>
          </div>

          {resumeUrl ? (
            <div className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline truncate"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{resumeFileName || 'Xem CV'}</span>
              </a>
              <button
                onClick={() => setConfirmDeleteResume(true)}
                className="text-gray-400 dark:text-gray-500 hover:text-red-500 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 border border-dashed border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition">
              {uploadingResume ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploadingResume ? 'Đang tải lên...' : 'Tải lên CV (PDF, Word - tối đa 5MB)'}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleUploadResume}
                disabled={uploadingResume}
                className="hidden"
              />
            </label>
          )}
        </div>

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

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-700 px-5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            Công việc
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'interviews'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Phỏng vấn
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <History className="w-4 h-4" />
            Lịch sử
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'ai'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Mock
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'tasks' && (
            <>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Công việc cần làm</h4>
                {tasks.length > 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">{doneCount}/{tasks.length} hoàn thành</span>
                )}
              </div>

              {loadingTasks ? (
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
            </>
          )}

          {activeTab === 'interviews' && (
            <>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Kết quả phỏng vấn</h4>
                <button
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium"
                >
                  {showNoteForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {showNoteForm ? 'Đóng' : 'Thêm ghi chú'}
                </button>
              </div>

              {showNoteForm && (
                <form onSubmit={handleAddNote} className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Ngày phỏng vấn</label>
                    <input
                      type="date"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Tự đánh giá</label>
                    <StarRating value={rating} onChange={setRating} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Ghi chú (câu hỏi gặp phải, cảm nhận...)</label>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="VD: Được hỏi về kinh nghiệm với React, cảm thấy tự tin ở phần thuật toán..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingNote}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu ghi chú'}
                  </button>
                </form>
              )}

              {loadingNotes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                </div>
              ) : interviewNotes.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                  Chưa có ghi chú phỏng vấn nào.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {interviewNotes.map((note) => (
                    <li
                      key={note.id}
                      className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg group relative"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {note.interviewDate}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= (note.rating || 0)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => setConfirmDeleteNoteId(note.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-500 hover:text-red-500 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {note.notes && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">{note.notes}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {activeTab === 'timeline' && (
            <>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Lịch sử thao tác</h4>

              {loadingActivity ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                </div>
              ) : activity.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                  Chưa có lịch sử thao tác nào.
                </p>
              ) : (
                <ul className="relative border-l-2 border-gray-100 dark:border-gray-700 ml-1.5 space-y-5">
                  {activity.map((log) => (
                    <li key={log.id} className="ml-4 relative">
                      <span className="absolute -left-[22.5px] top-0.5 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white dark:border-gray-800" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {log.action === 'STATUS_CHANGED' ? (
                          <span className="flex items-center gap-1 flex-wrap">
                            <span className="text-gray-500 dark:text-gray-400">{STATUS_LABEL[log.fromStatus] || log.fromStatus}</span>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span className="font-medium">{STATUS_LABEL[log.toStatus] || log.toStatus}</span>
                          </span>
                        ) : (
                          log.description
                        )}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {formatTimestamp(log.timestamp)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {activeTab === 'ai' && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Câu hỏi phỏng vấn mô phỏng (AI)
                </h4>
              </div>

              <textarea
                placeholder="Dán mô tả công việc (JD) vào đây để câu hỏi sát hơn (không bắt buộc)"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
              />

              <button
                onClick={handleGenerateAi}
                disabled={generatingAi}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60 mb-4"
              >
                {generatingAi ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : questions.length > 0 ? (
                  <RefreshCw className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {generatingAi
                  ? 'Đang tạo câu hỏi...'
                  : questions.length > 0
                  ? 'Tạo lại câu hỏi khác'
                  : 'Tạo câu hỏi phỏng vấn'}
              </button>

              {aiError && (
                <p className="text-xs text-red-500 text-center mb-3">{aiError}</p>
              )}

              {questions.length > 0 && (
                <ul className="space-y-2.5">
                  {questions.map((q, index) => (
                    <li
                      key={index}
                      className="flex gap-2.5 p-3 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-lg"
                    >
                      <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{q}</p>
                    </li>
                  ))}
                </ul>
              )}

              {questions.length === 0 && !generatingAi && !aiError && (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                  Bấm nút phía trên để AI tạo bộ câu hỏi phỏng vấn dựa trên vị trí "{job.position}" tại {job.company}.
                </p>
              )}
            </>
          )}
        </div>

        {/* Add task form - chỉ hiện ở tab Tasks */}
        {activeTab === 'tasks' && (
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
        )}
      </div>

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Xóa công việc"
        message="Bạn có chắc muốn xóa công việc này không?"
        onConfirm={confirmDeleteTask}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <ConfirmModal
        open={!!confirmDeleteNoteId}
        title="Xóa ghi chú phỏng vấn"
        message="Bạn có chắc muốn xóa ghi chú này không?"
        onConfirm={confirmDeleteNote}
        onCancel={() => setConfirmDeleteNoteId(null)}
      />
      <ConfirmModal
        open={confirmDeleteResume}
        title="Xóa CV"
        message="Bạn có chắc muốn xóa CV đã tải lên không?"
        onConfirm={confirmDeleteResumeAction}
        onCancel={() => setConfirmDeleteResume(false)}
      />
    </div>
  );
}

export default JobDetailModal;