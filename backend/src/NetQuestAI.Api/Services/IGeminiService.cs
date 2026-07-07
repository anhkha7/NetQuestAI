namespace NetQuestAI.Api.Services;

public interface IGeminiService
{
    Task<string> GetFeedbackAsync(string challengeTitle, string initialConfig, string targetRequirements, string submittedConfig, CancellationToken ct = default);
}
