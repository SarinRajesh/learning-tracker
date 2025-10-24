using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearningTracker.API.Data;
using LearningTracker.API.Models;

namespace LearningTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;
    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{userId}")]
    public IActionResult GetTasks(int userId)
    {
        var tasks = _context.Tasks
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToList();

        // Manually load related data to avoid circular references
        foreach (var task in tasks)
        {
            task.SubTopics = _context.SubTopics
                .Where(s => s.TaskItemId == task.Id)
                .OrderBy(s => s.Order)
                .ToList();
            
            task.LearningSessions = _context.LearningSessions
                .Where(l => l.TaskItemId == task.Id)
                .OrderByDescending(l => l.StartedAt)
                .ToList();
        }

        return Ok(tasks);
    }

    [HttpGet("{userId}/timeline")]
    public IActionResult GetTimeline(int userId)
    {
        try
        {
            var timeline = _context.LearningSessions
                .Where(l => l.TaskItem != null && l.TaskItem.UserId == userId)
                .OrderByDescending(l => l.StartedAt)
                .Select(l => new {
                    l.Id,
                    l.StartedAt,
                    l.EndedAt,
                    l.DurationMinutes,
                    l.Notes,
                    l.SubTopicsStudied,
                    l.SubTopicsStudiedAt,
                    TaskItem = new {
                        l.TaskItem.Id,
                        l.TaskItem.Title,
                        l.TaskItem.Category
                    }
                })
                .ToList();
            return Ok(timeline);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, details = ex.StackTrace });
        }
    }

    [HttpPost]
    public IActionResult AddTask([FromBody] TaskItem task)
    {
        task.CreatedAt = DateTime.UtcNow;
        _context.Tasks.Add(task);
        _context.SaveChanges();
        return Ok(task);
    }

    [HttpPost("{taskId}/start")]
    public IActionResult StartTask(int taskId)
    {
        var task = _context.Tasks.Find(taskId);
        if (task == null) return NotFound();
        
        if (task.StartedAt == null)
        {
            task.StartedAt = DateTime.UtcNow;
        }
        
        _context.SaveChanges();
        return Ok(task);
    }

    [HttpPost("{taskId}/complete")]
    public IActionResult CompleteTask(int taskId)
    {
        var task = _context.Tasks.Find(taskId);
        if (task == null) return NotFound();
        
        task.IsCompleted = true;
        task.CompletedAt = DateTime.UtcNow;
        
        _context.SaveChanges();
        return Ok(task);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateTask(int id, [FromBody] TaskItem task)
    {
        var existing = _context.Tasks.Find(id);
        if (existing == null) return NotFound();
        
        existing.Title = task.Title;
        existing.Description = task.Description;
        existing.IsCompleted = task.IsCompleted;
        existing.Priority = task.Priority;
        existing.Category = task.Category;
        
        if (task.IsCompleted && existing.CompletedAt == null)
        {
            existing.CompletedAt = DateTime.UtcNow;
        }
        else if (!task.IsCompleted)
        {
            existing.CompletedAt = null;
        }
        
        _context.SaveChanges();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteTask(int id)
    {
        var task = _context.Tasks.Find(id);
        if (task == null) return NotFound();
        _context.Tasks.Remove(task);
        _context.SaveChanges();
        return Ok();
    }

    // SubTopic endpoints
    [HttpGet("{taskId}/subtopics")]
    public IActionResult GetSubTopics(int taskId)
    {
        var subtopics = _context.SubTopics
            .Where(s => s.TaskItemId == taskId)
            .OrderBy(s => s.Order)
            .ToList();
        return Ok(subtopics);
    }

    [HttpPost("{taskId}/subtopics")]
    public IActionResult AddSubTopic(int taskId, [FromBody] SubTopic subtopic)
    {
        subtopic.TaskItemId = taskId;
        subtopic.CreatedAt = DateTime.UtcNow;
        _context.SubTopics.Add(subtopic);
        _context.SaveChanges();
        return Ok(subtopic);
    }

    [HttpPut("subtopics/{id}")]
    public IActionResult UpdateSubTopic(int id, [FromBody] SubTopic subtopic)
    {
        var existing = _context.SubTopics.Find(id);
        if (existing == null) return NotFound();
        
        existing.Title = subtopic.Title;
        existing.Description = subtopic.Description;
        existing.IsCompleted = subtopic.IsCompleted;
        existing.Order = subtopic.Order;
        
        if (subtopic.IsCompleted && existing.CompletedAt == null)
        {
            existing.CompletedAt = DateTime.UtcNow;
        }
        else if (!subtopic.IsCompleted)
        {
            existing.CompletedAt = null;
        }
        
        _context.SaveChanges();
        return Ok(existing);
    }

    [HttpDelete("subtopics/{id}")]
    public IActionResult DeleteSubTopic(int id)
    {
        var subtopic = _context.SubTopics.Find(id);
        if (subtopic == null) return NotFound();
        _context.SubTopics.Remove(subtopic);
        _context.SaveChanges();
        return Ok();
    }

    // Learning Session endpoints
    [HttpPost("{taskId}/sessions")]
    public IActionResult StartLearningSession(int taskId, [FromBody] LearningSession session)
    {
        session.TaskItemId = taskId;
        session.StartedAt = DateTime.UtcNow;
        _context.LearningSessions.Add(session);
        _context.SaveChanges();
        return Ok(session);
    }

    [HttpPut("sessions/{id}/end")]
    public IActionResult EndLearningSession(int id, [FromBody] LearningSession session)
    {
        var existing = _context.LearningSessions.Find(id);
        if (existing == null) return NotFound();
        
        existing.EndedAt = DateTime.UtcNow;
        existing.DurationMinutes = (int)(existing.EndedAt.Value - existing.StartedAt).TotalMinutes;
        existing.Notes = session.Notes;
        existing.SubTopicsStudied = session.SubTopicsStudied;
        existing.SubTopicsStudiedAt = !string.IsNullOrEmpty(session.SubTopicsStudied) ? DateTime.UtcNow : null;
        
        _context.SaveChanges();
        return Ok(existing);
    }

    [HttpGet("{taskId}/sessions")]
    public IActionResult GetLearningSessions(int taskId)
    {
        var sessions = _context.LearningSessions
            .Where(l => l.TaskItemId == taskId)
            .OrderByDescending(l => l.StartedAt)
            .ToList();
        return Ok(sessions);
    }
}
