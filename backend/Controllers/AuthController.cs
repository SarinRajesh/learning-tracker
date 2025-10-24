using Microsoft.AspNetCore.Mvc;
using LearningTracker.API.Data;
using LearningTracker.API.Models;
using System.Security.Cryptography;
using System.Text;

namespace LearningTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        if (_context.Users.Any(u => u.Username == request.Username))
            return BadRequest("Username already exists");

        var user = new User
        {
            Username = request.Username,
            PasswordHash = HashPassword(request.Password)
        };

        _context.Users.Add(user);
        _context.SaveChanges();
        return Ok("Registered successfully");
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var existingUser = _context.Users.FirstOrDefault(u => u.Username == request.Username);
        if (existingUser == null || !VerifyPassword(request.Password, existingUser.PasswordHash))
            return Unauthorized("Invalid credentials");

        return Ok(new { message = "Login successful", userId = existingUser.Id });
    }

    private string HashPassword(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    private bool VerifyPassword(string password, string hash)
    {
        return HashPassword(password) == hash;
    }
}
