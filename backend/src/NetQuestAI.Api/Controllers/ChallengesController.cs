using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetQuestAI.Api.Data;
using NetQuestAI.Api.DTOs.Challenge;
using NetQuestAI.Api.Models;

namespace NetQuestAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChallengesController(AppDbContext db, ILogger<ChallengesController> logger) : ControllerBase
{
    /// <summary>Get a paginated list of active challenges (summary view).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ChallengeSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] Difficulty? difficulty,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var query = db.Challenges.Where(c => c.IsActive).AsQueryable();

        if (difficulty.HasValue)
            query = query.Where(c => c.Difficulty == difficulty.Value);

        var total = await query.CountAsync(ct);
        var challenges = await query
            .OrderBy(c => c.Difficulty)
            .ThenByDescending(c => c.Points)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new ChallengeSummaryDto(c.Id, c.Title, c.Difficulty.ToString(), c.Points, c.IsActive))
            .ToListAsync(ct);

        return Ok(new { total, page, pageSize, data = challenges });
    }

    /// <summary>Get full details of a specific challenge by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ChallengeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var challenge = await db.Challenges.FindAsync([id], ct);

        if (challenge is null || !challenge.IsActive)
            return NotFound(new { message = $"Challenge {id} not found." });

        var dto = new ChallengeDto(
            challenge.Id,
            challenge.Title,
            challenge.Description,
            challenge.Difficulty.ToString(),
            challenge.InitialConfig,
            challenge.TargetRequirements,
            challenge.Points,
            challenge.IsActive,
            challenge.CreatedAt
        );

        return Ok(dto);
    }

    /// <summary>Admin only — create a new challenge.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ChallengeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateChallengeRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var flagHash = ComputeSha256(request.Flag);

        var challenge = new Challenge
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Difficulty = Enum.Parse<Difficulty>(request.Difficulty, ignoreCase: true),
            InitialConfig = request.InitialConfig,
            TargetRequirements = request.TargetRequirements,
            Points = request.Points,
            FlagHash = flagHash,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        db.Challenges.Add(challenge);
        await db.SaveChangesAsync(ct);

        logger.LogInformation("Challenge '{Title}' created with Id {Id}", challenge.Title, challenge.Id);

        var dto = new ChallengeDto(
            challenge.Id, challenge.Title, challenge.Description,
            challenge.Difficulty.ToString(), challenge.InitialConfig,
            challenge.TargetRequirements, challenge.Points, challenge.IsActive, challenge.CreatedAt);

        return CreatedAtAction(nameof(GetById), new { id = challenge.Id }, dto);
    }

    /// <summary>Admin only — update an existing challenge.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateChallengeRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var challenge = await db.Challenges.FindAsync([id], ct);
        if (challenge is null)
            return NotFound(new { message = $"Challenge {id} not found." });

        challenge.Title = request.Title;
        challenge.Description = request.Description;
        challenge.Difficulty = Enum.Parse<Difficulty>(request.Difficulty, ignoreCase: true);
        challenge.InitialConfig = request.InitialConfig;
        challenge.TargetRequirements = request.TargetRequirements;
        challenge.Points = request.Points;
        challenge.IsActive = request.IsActive;

        if (!string.IsNullOrWhiteSpace(request.Flag))
        {
            challenge.FlagHash = ComputeSha256(request.Flag);
        }

        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>Admin only — delete a challenge.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var challenge = await db.Challenges.FindAsync([id], ct);
        if (challenge is null)
            return NotFound(new { message = $"Challenge {id} not found." });

        db.Challenges.Remove(challenge);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static string ComputeSha256(string input)
    {
        var bytes = System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}

// ---- Inline request model for challenge creation ----
public record CreateChallengeRequest(
    [System.ComponentModel.DataAnnotations.Required] string Title,
    [System.ComponentModel.DataAnnotations.Required] string Description,
    [System.ComponentModel.DataAnnotations.Required] string Difficulty,
    [System.ComponentModel.DataAnnotations.Required] string Flag,
    int Points = 100,
    string InitialConfig = "{}",
    string TargetRequirements = "{}"
);

public record UpdateChallengeRequest(
    [System.ComponentModel.DataAnnotations.Required] string Title,
    [System.ComponentModel.DataAnnotations.Required] string Description,
    [System.ComponentModel.DataAnnotations.Required] string Difficulty,
    string? Flag,
    int Points = 100,
    string InitialConfig = "{}",
    string TargetRequirements = "{}",
    bool IsActive = true
);
