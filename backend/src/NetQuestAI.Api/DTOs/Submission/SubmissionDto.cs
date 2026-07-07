using System.ComponentModel.DataAnnotations;

namespace NetQuestAI.Api.DTOs.Submission;

public record SubmitFlagRequest(
    [Required] Guid ChallengeId,
    [Required] string Flag,
    string SubmittedConfig = "{}"
);

public record SubmissionResultDto(
    Guid Id,
    bool IsPassed,
    int Score,
    string? AIFeedback,
    DateTime SubmittedAt
);

public record SubmissionDto(
    Guid Id,
    Guid UserId,
    string Username,
    Guid ChallengeId,
    string ChallengeTitle,
    string SubmittedConfig,
    int Score,
    string? AIFeedback,
    bool IsPassed,
    DateTime SubmittedAt
);
