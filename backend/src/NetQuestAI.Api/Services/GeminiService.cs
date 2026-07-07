using System.Text;
using System.Text.Json;

namespace NetQuestAI.Api.Services;

public class GeminiService(IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<GeminiService> logger) : IGeminiService
{
    public async Task<string> GetFeedbackAsync(
        string challengeTitle,
        string initialConfig,
        string targetRequirements,
        string submittedConfig,
        CancellationToken ct = default)
    {
        var apiKey = configuration["Gemini:ApiKey"];
        
        if (string.IsNullOrWhiteSpace(apiKey) || apiKey == "YOUR_GEMINI_API_KEY")
        {
            logger.LogWarning("Gemini API Key is not configured. Falling back to Mock Mode.");
            return GetMockFeedback(challengeTitle, submittedConfig);
        }

        try
        {
            var client = httpClientFactory.CreateClient();
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

            var prompt = $@"
You are a Principal Network Architect and CTF Evaluator.
Analyze the following network challenge submission and provide feedback.

Challenge: {challengeTitle}
Initial Configuration: {initialConfig}
Target Requirements: {targetRequirements}
Submitted Configuration: {submittedConfig}

Please provide:
1. An evaluation of whether their configuration is robust and secure.
2. 2-3 specific recommendations or optimization tips (e.g. regarding routing protocols, subnets, firewall rules).
Keep the feedback concise, technical, and constructive. Return response in Markdown format.
";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await client.PostAsync(url, content, ct);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(ct);
                logger.LogError("Gemini API returned error status: {Status}. Details: {Details}", response.StatusCode, errorContent);
                return $"[System Note: Failed to fetch AI Feedback from Gemini API. Status: {response.StatusCode}]\n\n{GetMockFeedback(challengeTitle, submittedConfig)}";
            }

            var responseJson = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(responseJson);
            
            // Extract the generated text from Gemini response schema
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return text ?? "Unable to extract response from AI evaluator.";
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error while calling Gemini API.");
            return $"[System Note: AI Feedback generation encountered an error: {ex.Message}]\n\n{GetMockFeedback(challengeTitle, submittedConfig)}";
        }
    }

    private static string GetMockFeedback(string challengeTitle, string submittedConfig)
    {
        return $@"### 🤖 AI Evaluation (Mock Mode)
- **Challenge**: *{challengeTitle}*
- **Status**: Cấu hình mạng đã được phân tích sơ bộ.
- **Phản hồi**: 
  1. Cấu hình gửi lên trông rất ổn định. Cần tối ưu hóa cấu trúc subnet để giảm thiểu broadcast domain.
  2. Hãy kiểm tra lại các ACLs/Firewall rules để chắc chắn chỉ các port cần thiết được mở.
  
*(Lưu ý: Bạn có thể nhập Gemini:ApiKey trong appsettings.Development.json để có phản hồi thông minh từ AI thật)*";
    }
}
