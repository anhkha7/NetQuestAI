namespace NetQuestAI.Api.DTOs.Challenge;

public record ChallengeDto(
    Guid Id,
    string Title,
    string Description,
    string Difficulty,
    string InitialConfig,
    string TargetRequirements,
    int Points,
    bool IsActive,
    DateTime CreatedAt
);

public record ChallengeSummaryDto(
    Guid Id,
    string Title,
    string Difficulty,
    int Points,
    bool IsActive
);
