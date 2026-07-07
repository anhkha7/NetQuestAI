using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetQuestAI.Api.Models;

namespace NetQuestAI.Api.Data.Configurations;

public class ChallengeConfiguration : IEntityTypeConfiguration<Challenge>
{
    public void Configure(EntityTypeBuilder<Challenge> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .ValueGeneratedOnAdd();

        builder.Property(c => c.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Description)
            .IsRequired();

        builder.Property(c => c.Difficulty)
            .HasConversion<string>()
            .HasMaxLength(10);

        builder.Property(c => c.InitialConfig)
            .HasColumnType("TEXT")
            .HasDefaultValue("{}");

        builder.Property(c => c.TargetRequirements)
            .HasColumnType("TEXT")
            .HasDefaultValue("{}");

        builder.Property(c => c.Points)
            .IsRequired();

        builder.Property(c => c.FlagHash)
            .IsRequired()
            .HasMaxLength(64);

        builder.Property(c => c.IsActive)
            .HasDefaultValue(true);

        builder.HasMany(c => c.Submissions)
            .WithOne(s => s.Challenge)
            .HasForeignKey(s => s.ChallengeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
