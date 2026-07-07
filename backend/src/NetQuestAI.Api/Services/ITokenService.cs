using NetQuestAI.Api.Models;

namespace NetQuestAI.Api.Services;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(User user);
}
