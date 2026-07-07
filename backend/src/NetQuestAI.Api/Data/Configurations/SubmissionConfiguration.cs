using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetQuestAI.Api.Models;

namespace NetQuestAI.Api.Data.Configurations;

public class SubmissionConfiguration : IEntityTypeConfiguration<Submission>
{
    public void Configure(EntityTypeBuilder<Submission> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .ValueGeneratedOnAdd();

        builder.Property(s => s.SubmittedConfig)
            .HasColumnType("TEXT")
            .HasDefaultValue("{}");

        builder.Property(s => s.Score)
            .HasDefaultValue(0);

        builder.Property(s => s.AIFeedback)
            .HasColumnType("TEXT");

        builder.Property(s => s.IsPassed)
            .HasDefaultValue(false);

        builder.Property(s => s.SubmittedAt)
            .IsRequired();

        // Relationships defined in User/Challenge configurations
        builder.HasOne(s => s.User)
            .WithMany(u => u.Submissions)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Challenge)
            .WithMany(c => c.Submissions)
            .HasForeignKey(s => s.ChallengeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => new { s.UserId, s.ChallengeId });
    }
}
