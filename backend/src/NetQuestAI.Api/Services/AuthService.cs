using Microsoft.EntityFrameworkCore;
using NetQuestAI.Api.Data;
using NetQuestAI.Api.DTOs.Auth;
using NetQuestAI.Api.Models;

namespace NetQuestAI.Api.Services;

public class AuthService(AppDbContext db, ITokenService tokenService) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        // Check uniqueness
        if (await db.Users.AnyAsync(u => u.Username == request.Username, ct))
            throw new InvalidOperationException($"Username '{request.Username}' is already taken.");

        if (await db.Users.AnyAsync(u => u.Email == request.Email, ct))
            throw new InvalidOperationException($"Email '{request.Email}' is already registered.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Student,
            TotalPoints = 0,
            CreatedAt = DateTime.UtcNow
        };

        db.Users.Add(user);
        await db.SaveChangesAsync(ct);

        var (token, expiresAt) = tokenService.GenerateToken(user);

        return new AuthResponse(token, user.Username, user.Email, user.Role.ToString(), user.TotalPoints, expiresAt);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        // Allow login by username or email
        var user = await db.Users.FirstOrDefaultAsync(
            u => u.Username == request.UsernameOrEmail || u.Email == request.UsernameOrEmail, ct);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");

        var (token, expiresAt) = tokenService.GenerateToken(user);

        return new AuthResponse(token, user.Username, user.Email, user.Role.ToString(), user.TotalPoints, expiresAt);
    }
}
