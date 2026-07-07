using Microsoft.EntityFrameworkCore;
using NetQuestAI.Api.Models;
using NetQuestAI.Api.Data.Configurations;

namespace NetQuestAI.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Challenge> Challenges => Set<Challenge>();
    public DbSet<Submission> Submissions => Set<Submission>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new ChallengeConfiguration());
        modelBuilder.ApplyConfiguration(new SubmissionConfiguration());
    }
}
