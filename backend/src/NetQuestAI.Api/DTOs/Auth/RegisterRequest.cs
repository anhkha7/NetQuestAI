using System.ComponentModel.DataAnnotations;

namespace NetQuestAI.Api.DTOs.Auth;

public record RegisterRequest(
    [Required, MinLength(3), MaxLength(50)] string Username,
    [Required, EmailAddress, MaxLength(256)] string Email,
    [Required, MinLength(8)] string Password
);
