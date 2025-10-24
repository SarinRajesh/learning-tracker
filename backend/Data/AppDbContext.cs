using Microsoft.EntityFrameworkCore;
using LearningTracker.API.Models;

namespace LearningTracker.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<SubTopic> SubTopics => Set<SubTopic>();
    public DbSet<LearningSession> LearningSessions => Set<LearningSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure TaskItem relationships
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskItem>()
            .HasMany(t => t.SubTopics)
            .WithOne(s => s.TaskItem)
            .HasForeignKey(s => s.TaskItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskItem>()
            .HasMany(t => t.LearningSessions)
            .WithOne(l => l.TaskItem)
            .HasForeignKey(l => l.TaskItemId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure indexes for better performance
        modelBuilder.Entity<TaskItem>()
            .HasIndex(t => t.UserId);

        modelBuilder.Entity<TaskItem>()
            .HasIndex(t => t.CreatedAt);

        modelBuilder.Entity<SubTopic>()
            .HasIndex(s => s.TaskItemId);

        modelBuilder.Entity<LearningSession>()
            .HasIndex(l => l.TaskItemId);

        modelBuilder.Entity<LearningSession>()
            .HasIndex(l => l.StartedAt);
    }
}
