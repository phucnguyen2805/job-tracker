package com.jobtracker.job_tracker_backend.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import com.jobtracker.job_tracker_backend.model.User;
import com.jobtracker.job_tracker_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;

import com.jobtracker.job_tracker_backend.exception.AiQuotaExceededException;

@Service
public class AiService {

    @Autowired
    private UserRepository userRepository;

    private static final int DAILY_LIMIT = 10; // Tối đa 10 lần/ngày/user

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=";

    public List<String> generateMockInterviewQuestions(String userId, String company, String position, String jobDescription) {
        checkAndUpdateUsage(userId);

        String prompt = buildPrompt(company, position, jobDescription);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String requestBody = """
                {
                  "contents": [{
                    "parts": [{"text": %s}]
                  }]
                }
                """.formatted(objectMapper.writeValueAsString(prompt));

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            String response = restTemplate.postForObject(
                    GEMINI_URL + geminiApiKey, entity, String.class);

            return parseQuestions(response);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Không thể tạo câu hỏi phỏng vấn lúc này, vui lòng thử lại sau");
        }
    }

    private void checkAndUpdateUsage(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        String today = LocalDate.now().toString();

        if (user.getAiUsageDate() == null || !user.getAiUsageDate().equals(today)) {
            // Ngày mới -> reset bộ đếm
            user.setAiUsageDate(today);
            user.setAiUsageCount(0);
        }

        int currentCount = user.getAiUsageCount() != null ? user.getAiUsageCount() : 0;

        if (currentCount >= DAILY_LIMIT) {
            throw new AiQuotaExceededException(
                    "Bạn đã dùng hết " + DAILY_LIMIT + " lượt tạo câu hỏi AI hôm nay. Vui lòng thử lại vào ngày mai.");
        }

        user.setAiUsageCount(currentCount + 1);
        userRepository.save(user);
    }

    private String buildPrompt(String company, String position, String jobDescription) {
        StringBuilder sb = new StringBuilder();
        sb.append("Bạn là chuyên gia tuyển dụng. Hãy tạo ra đúng 6 câu hỏi phỏng vấn mô phỏng ")
                .append("(mock interview) cho vị trí \"").append(position)
                .append("\" tại công ty \"").append(company).append("\". ");

        if (jobDescription != null && !jobDescription.isBlank()) {
            sb.append("Đây là mô tả công việc (JD) để tham khảo: \"").append(jobDescription).append("\". ");
        }

        sb.append("Câu hỏi nên bao gồm cả câu hỏi kỹ thuật liên quan vị trí và câu hỏi hành vi/thái độ. ")
                .append("Trả lời CHỈ bằng danh sách 6 câu hỏi, mỗi câu 1 dòng, không đánh số, ")
                .append("không thêm giải thích hay lời dẫn nào khác.");

        return sb.toString();
    }

    private List<String> parseQuestions(String response) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        String text = root
                .path("candidates").get(0)
                .path("content").path("parts").get(0)
                .path("text").asText();

        return text.lines()
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .map(line -> line.replaceFirst("^[-*\\d.)\\s]+", "")) // xóa số thứ tự/gạch đầu dòng nếu AI tự thêm
                .toList();
    }
}