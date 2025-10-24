namespace LearningTracker.API.Models;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsCompleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int Priority { get; set; } = 1; // 1=Low, 2=Medium, 3=High
    public string Category { get; set; } = string.Empty;

    public int UserId { get; set; }
    public User? User { get; set; }
    public ICollection<SubTopic> SubTopics { get; set; } = new List<SubTopic>();
    public ICollection<LearningSession> LearningSessions { get; set; } = new List<LearningSession>();
}

public class SubTopic
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsCompleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public int Order { get; set; } = 0;

    public int TaskItemId { get; set; }
    [System.Text.Json.Serialization.JsonIgnore]
    public TaskItem? TaskItem { get; set; }
}

public class LearningSession
{
    public int Id { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }
    public int DurationMinutes { get; set; } = 0;
    public string Notes { get; set; } = string.Empty;
    public string SubTopicsStudied { get; set; } = string.Empty; // JSON string of subtopic IDs
    public DateTime? SubTopicsStudiedAt { get; set; } // When subtopics were studied

    public int TaskItemId { get; set; }
    [System.Text.Json.Serialization.JsonIgnore]
    public TaskItem? TaskItem { get; set; }
}
