using System.ComponentModel.DataAnnotations;

namespace NetQuestAI.Api.DTOs.Auth;

public record LoginRequest(
    [Required] string UsernameOrEmail,
    [Required] string Password
);
