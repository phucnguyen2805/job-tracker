import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Briefcase, CalendarDays, BarChart3, Sparkles, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    icon: Briefcase,
    title: 'Chào mừng đến với Job Tracker!',
    description:
      'Đây là công cụ giúp bạn theo dõi toàn bộ quá trình ứng tuyển việc làm — từ lúc nộp đơn đến khi nhận offer. Cùng khám phá nhanh các tính năng chính nhé.',
  },
  {
    icon: Briefcase,
    title: 'Kanban Board',
    description:
      'Thêm đơn ứng tuyển và kéo-thả giữa các cột: Đã ứng tuyển → Đang phỏng vấn → Nhận offer / Bị từ chối. Bấm vào 1 thẻ để xem chi tiết, quản lý công việc, ghi chú phỏng vấn và tạo câu hỏi phỏng vấn bằng AI.',
  },
  {
    icon: CalendarDays,
    title: 'Lịch & Nhắc nhở',
    description:
      'Xem deadline và lịch phỏng vấn dạng lịch tháng. Hệ thống sẽ tự động cảnh báo khi có đơn sắp đến hạn hoặc quá hạn, kể cả gửi email nhắc nhở.',
  },
  {
    icon: BarChart3,
    title: 'Thống kê',
    description:
      'Theo dõi tỷ lệ phản hồi, tỷ lệ nhận offer, và xu hướng ứng tuyển theo thời gian bằng biểu đồ trực quan.',
  },
  {
    icon: Sparkles,
    title: 'Sẵn sàng bắt đầu!',
    description:
      'Bấm "Bắt đầu" để tạo đơn ứng tuyển đầu tiên của bạn. Bạn có thể xem lại hướng dẫn này bất cứ lúc nào bằng nút trợ giúp (?) trên header.',
  },
];

function OnboardingTour({ onClose }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const handleFinish = () => {
    localStorage.setItem('onboardingSeen', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="relative bg-gradient-to-br from-indigo-500 to-indigo-700 px-6 pt-8 pb-10 text-center">
          <button
            onClick={handleFinish}
            className="absolute top-3 right-3 text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-3">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-white font-bold text-lg">{current.title}</h3>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed min-h-[70px]">
            {current.description}
          </p>

          <div className="flex items-center justify-center gap-1.5 my-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-indigo-600' : 'w-1.5 bg-gray-200 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {!isFirst && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Trước
              </button>
            )}
            <button
              onClick={isLast ? handleFinish : () => setStep(step + 1)}
              className="flex-1 flex items-center justify-center gap-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              {isLast ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Bắt đầu
                </>
              ) : (
                <>
                  Tiếp
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingTour;