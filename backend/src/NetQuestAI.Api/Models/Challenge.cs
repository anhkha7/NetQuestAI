namespace NetQuestAI.Api.Models;

public enum Difficulty
{
    Easy,
    Medium,
    Hard
}

public class Challenge
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Difficulty Difficulty { get; set; }

    /// <summary>JSON string representing the initial network configuration presented to the player.</summary>
    public string InitialConfig { get; set; } = "{}";

    /// <summary>JSON string describing what the network configuration must achieve to pass.</summary>
    public string TargetRequirements { get; set; } = "{}";

    public int Points { get; set; }

    /// <summary>SHA-256 hash of the challenge flag — never stored in plaintext.</summary>
    public string FlagHash { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Submission> Submissions { get; set; } = [];
}
