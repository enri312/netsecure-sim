using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NetSecure.Api.Data;
using NetSecure.Api.Models.DTOs;
using NetSecure.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ============ Add Services ============

// Database - PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Authentication - JWT
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "NetSecureDefaultSecretKey2024!MinLength32";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "NetSecure.Api",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "NetSecure.Client",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

// Custom Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<ITrafficEngine, TrafficEngine>();

// CORS - Allow frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://127.0.0.1:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// ============ Configure Pipeline ============

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// ============ Endpoints ============

// Health Check
app.MapGet("/", () => Results.Ok(new
{
    Name = "NetSecure Sim API",
    Version = "1.0.0",
    Status = "Running",
    Timestamp = DateTime.UtcNow
})).WithTags("Health");

app.MapGet("/api/health", () => Results.Ok("Healthy")).WithTags("Health");

// ============ Auth Endpoints ============
var authGroup = app.MapGroup("/api/auth").WithTags("Authentication");

authGroup.MapPost("/login", async (LoginRequest request, IAuthService authService) =>
{
    var result = await authService.LoginAsync(request);
    if (result == null)
        return Results.Unauthorized();
    return Results.Ok(result);
});

authGroup.MapGet("/me", async (ClaimsPrincipal user, IAuthService authService) =>
{
    var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
        return Results.Unauthorized();

    var userInfo = await authService.GetUserInfoAsync(userId);
    if (userInfo == null)
        return Results.NotFound();

    return Results.Ok(userInfo);
}).RequireAuthorization();

// ============ Network Endpoints ============
var networkGroup = app.MapGroup("/api/network").WithTags("Network").RequireAuthorization();

networkGroup.MapGet("/topology", async (AppDbContext db) =>
{
    var vlans = await db.Vlans
        .Include(v => v.Devices)
        .Select(v => new VlanDto(
            v.Id,
            v.VlanId,
            v.Name,
            v.Subnet,
            v.Color,
            v.Devices.Select(d => new DeviceDto(d.Id, d.Name, d.Ip, d.Type)).ToList()
        ))
        .ToListAsync();

    return Results.Ok(vlans);
});

networkGroup.MapPost("/devices", async (CreateDeviceRequest request, AppDbContext db) =>
{
    var vlan = await db.Vlans.FindAsync(request.VlanId);
    if (vlan == null)
        return Results.NotFound("VLAN not found");

    var device = new NetSecure.Api.Models.Device
    {
        Name = request.Name,
        Ip = request.Ip,
        Type = request.Type,
        VlanId = request.VlanId
    };

    db.Devices.Add(device);
    await db.SaveChangesAsync();

    return Results.Created($"/api/network/devices/{device.Id}",
        new DeviceDto(device.Id, device.Name, device.Ip, device.Type));
});

networkGroup.MapDelete("/devices/{id}", async (int id, AppDbContext db) =>
{
    var device = await db.Devices.FindAsync(id);
    if (device == null)
        return Results.NotFound();

    db.Devices.Remove(device);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

// ============ Firewall Endpoints ============
var firewallGroup = app.MapGroup("/api/firewall").WithTags("Firewall").RequireAuthorization();

firewallGroup.MapGet("/rules", async (AppDbContext db) =>
{
    var rules = await db.AclRules
        .OrderBy(r => r.Priority)
        .Select(r => new AclRuleDto(
            r.Id,
            r.SourceVlanId,
            r.DestinationVlanId,
            r.Protocol,
            r.Action,
            r.Description
        ))
        .ToListAsync();

    return Results.Ok(rules);
});

firewallGroup.MapPost("/rules", async (CreateAclRuleRequest request, AppDbContext db) =>
{
    var rule = new NetSecure.Api.Models.AclRule
    {
        SourceVlanId = request.SrcVlanId,
        DestinationVlanId = request.DstVlanId,
        Protocol = request.Protocol,
        Action = request.Action,
        Description = request.Description,
        Priority = await db.AclRules.CountAsync() + 1,
        CreatedAt = DateTime.UtcNow
    };

    db.AclRules.Add(rule);
    await db.SaveChangesAsync();

    return Results.Created($"/api/firewall/rules/{rule.Id}",
        new AclRuleDto(rule.Id, rule.SourceVlanId, rule.DestinationVlanId,
            rule.Protocol, rule.Action, rule.Description));
});

firewallGroup.MapDelete("/rules/{id}", async (int id, AppDbContext db) =>
{
    var rule = await db.AclRules.FindAsync(id);
    if (rule == null)
        return Results.NotFound();

    db.AclRules.Remove(rule);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

// ============ Simulation Endpoints ============
var simGroup = app.MapGroup("/api").WithTags("Simulation");

// Main simulation endpoint (matches frontend expectation)
simGroup.MapPost("/simulation", (TrafficSimulationRequest request, ITrafficEngine engine) =>
{
    var result = engine.Simulate(request);
    return Results.Ok(result);
});

simGroup.MapPost("/traffic/simulate", (TrafficSimulationRequest request, ITrafficEngine engine) =>
{
    var result = engine.Simulate(request);
    return Results.Ok(result);
});

// ============ Logs Endpoints ============
var logsGroup = app.MapGroup("/api/logs").WithTags("Logs").RequireAuthorization();

logsGroup.MapGet("/", async (AppDbContext db, int page = 1, int pageSize = 50) =>
{
    var query = db.TrafficLogs.OrderByDescending(l => l.Timestamp);

    var totalCount = await query.CountAsync();
    var items = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(l => new TrafficLogDto(
            l.Id, l.Timestamp, l.SourceDevice, l.SourceVlan,
            l.DestinationDevice, l.DestinationVlan, l.Protocol,
            l.Result, l.Reason
        ))
        .ToListAsync();

    return Results.Ok(new PaginatedResponse<TrafficLogDto>(
        items, totalCount, page, pageSize,
        (int)Math.Ceiling(totalCount / (double)pageSize)
    ));
});

// ============ Database Migration ============
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        await db.Database.MigrateAsync();
    }
    catch
    {
        // If migrations fail, try to create the database
        await db.Database.EnsureCreatedAsync();
    }
}

app.Run();
