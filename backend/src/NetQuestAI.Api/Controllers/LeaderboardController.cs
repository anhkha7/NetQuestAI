using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetQuestAI.Api.Data;

namespace NetQuestAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetLeaderboard(CancellationToken ct)
    {
        var users = await db.Users
            .OrderByDescending(u => u.TotalPoints)
            .ThenBy(u => u.Username)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.TotalPoints,
                u.Role
            })
            .ToListAsync(ct);

        return Ok(users);
    }
}
