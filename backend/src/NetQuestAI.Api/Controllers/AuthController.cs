using Microsoft.AspNetCore.Mvc;
using NetQuestAI.Api.DTOs.Auth;
using NetQuestAI.Api.Services;

namespace NetQuestAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService, ILogger<AuthController> logger) : ControllerBase
{
    /// <summary>Register a new user account.</summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var response = await authService.RegisterAsync(request, ct);
            return StatusCode(StatusCodes.Status201Created, response);
        }
        catch (InvalidOperationException ex)
        {
            logger.LogWarning("Registration conflict: {Message}", ex.Message);
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error during registration.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }

    /// <summary>Login with username/email and password to receive a JWT.</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var response = await authService.LoginAsync(request, ct);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogWarning("Failed login attempt for: {UsernameOrEmail}", request.UsernameOrEmail);
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error during login.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
        }
    }
}
