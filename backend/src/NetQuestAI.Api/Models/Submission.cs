namespace NetQuestAI.Api.Models;

public class Submission
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid ChallengeId { get; set; }
    public Challenge Challenge { get; set; } = null!;

    /// <summary>JSON string of the network config the player submitted.</summary>
    public string SubmittedConfig { get; set; } = "{}";

    /// <summary>Score awarded for this submission (0 if not passed).</summary>
    public int Score { get; set; }

    /// <summary>AI-generated feedback text. Null until AI service processes the submission.</summary>
    public string? AIFeedback { get; set; }

    public bool IsPassed { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
}
