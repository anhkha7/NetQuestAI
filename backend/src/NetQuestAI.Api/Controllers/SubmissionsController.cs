using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetQuestAI.Api.Data;
using NetQuestAI.Api.DTOs.Submission;
using NetQuestAI.Api.Models;

namespace NetQuestAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubmissionsController(AppDbContext db, ILogger<SubmissionsController> logger) : ControllerBase
{
    /// <summary>Submit a flag for a challenge. Returns pass/fail and score.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(SubmissionResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Submit([FromBody] SubmitFlagRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);

        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Invalid token payload." });

        var challenge = await db.Challenges.FindAsync([request.ChallengeId], ct);
        if (challenge is null || !challenge.IsActive)
            return NotFound(new { message = "Challenge not found." });

        // Hash submitted flag and compare
        var submittedHash = ComputeSha256(request.Flag.Trim());
        var isPassed = string.Equals(submittedHash, challenge.FlagHash, StringComparison.OrdinalIgnoreCase);
        var score = isPassed ? challenge.Points : 0;

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ChallengeId = request.ChallengeId,
            SubmittedConfig = request.SubmittedConfig,
            Score = score,
            IsPassed = isPassed,
            AIFeedback = null, // Populated by AI service in a future phase
            SubmittedAt = DateTime.UtcNow
        };

        db.Submissions.Add(submission);

        // Update user total points if passed and not previously solved
        if (isPassed)
        {
            var alreadySolved = await db.Submissions.AnyAsync(
                s => s.UserId == userId && s.ChallengeId == request.ChallengeId && s.IsPassed, ct);

            if (!alreadySolved)
            {
                var user = await db.Users.FindAsync([userId], ct);
                if (user is not null)
                {
                    user.TotalPoints += score;
                    logger.LogInformation("User {UserId} solved challenge {ChallengeId} for {Points} pts",
                        userId, request.ChallengeId, score);
                }
            }
        }

        await db.SaveChangesAsync(ct);

        return Ok(new SubmissionResultDto(submission.Id, submission.IsPassed, submission.Score,
            submission.AIFeedback, submission.SubmittedAt));
    }

    /// <summary>Get the current user's submission history.</summary>
    [HttpGet("my")]
    [ProducesResponseType(typeof(IEnumerable<SubmissionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMine(CancellationToken ct)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);

        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var submissions = await db.Submissions
            .Where(s => s.UserId == userId)
            .Include(s => s.User)
            .Include(s => s.Challenge)
            .OrderByDescending(s => s.SubmittedAt)
            .Select(s => new SubmissionDto(
                s.Id, s.UserId, s.User.Username,
                s.ChallengeId, s.Challenge.Title,
                s.SubmittedConfig, s.Score, s.AIFeedback, s.IsPassed, s.SubmittedAt))
            .ToListAsync(ct);

        return Ok(submissions);
    }

    private static string ComputeSha256(string input)
    {
        var bytes = System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
