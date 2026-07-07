namespace NetQuestAI.Api.DTOs.Auth;

public record AuthResponse(
    string Token,
    string Username,
    string Email,
    string Role,
    int TotalPoints,
    DateTime ExpiresAt
);
