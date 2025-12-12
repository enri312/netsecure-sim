using Microsoft.EntityFrameworkCore;
using NetSecure.Api.Models;

namespace NetSecure.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Vlan> Vlans => Set<Vlan>();
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<AclRule> AclRules => Set<AclRule>();
    public DbSet<TrafficLog> TrafficLogs => Set<TrafficLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Username).IsUnique();
            entity.Property(u => u.Username).HasMaxLength(50);
            entity.Property(u => u.Role).HasMaxLength(20);
        });

        // VLAN configuration
        modelBuilder.Entity<Vlan>(entity =>
        {
            entity.HasIndex(v => v.VlanId).IsUnique();
            entity.Property(v => v.Name).HasMaxLength(100);
            entity.Property(v => v.Subnet).HasMaxLength(50);
            entity.Property(v => v.Color).HasMaxLength(50);
        });

        // Device configuration
        modelBuilder.Entity<Device>(entity =>
        {
            entity.Property(d => d.Name).HasMaxLength(100);
            entity.Property(d => d.Ip).HasMaxLength(50);
            entity.Property(d => d.Type).HasMaxLength(20);
            entity.HasOne(d => d.Vlan)
                  .WithMany(v => v.Devices)
                  .HasForeignKey(d => d.VlanId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ACL Rule configuration
        modelBuilder.Entity<AclRule>(entity =>
        {
            entity.Property(a => a.Protocol).HasMaxLength(10);
            entity.Property(a => a.Action).HasMaxLength(20);
            entity.Property(a => a.Description).HasMaxLength(200);
        });

        // Traffic Log configuration
        modelBuilder.Entity<TrafficLog>(entity =>
        {
            entity.Property(t => t.SourceDevice).HasMaxLength(100);
            entity.Property(t => t.SourceVlan).HasMaxLength(50);
            entity.Property(t => t.DestinationDevice).HasMaxLength(100);
            entity.Property(t => t.DestinationVlan).HasMaxLength(50);
            entity.Property(t => t.Protocol).HasMaxLength(10);
            entity.Property(t => t.Result).HasMaxLength(20);
            entity.Property(t => t.Reason).HasMaxLength(500);
            entity.HasIndex(t => t.Timestamp);
        });

        // Seed default data
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Seed default users
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Username = "CENV",
                // Valid BCrypt hash for "8994C"
                PasswordHash = "$2a$11$D1HaR75k6pj6riZMp9rPSut5QAJUUTb7PgLloblA74sz7osAG7de.",
                Role = "admin",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // Seed default VLANs
        modelBuilder.Entity<Vlan>().HasData(
            new Vlan { Id = 1, VlanId = 10, Name = "Administración", Subnet = "192.168.10.0/24", Color = "bg-emerald-600" },
            new Vlan { Id = 2, VlanId = 20, Name = "Ventas", Subnet = "192.168.20.0/24", Color = "bg-blue-600" },
            new Vlan { Id = 3, VlanId = 30, Name = "IoT / Cámaras", Subnet = "192.168.30.0/24", Color = "bg-orange-600" },
            new Vlan { Id = 4, VlanId = 99, Name = "Servidores DMZ", Subnet = "172.16.1.0/24", Color = "bg-purple-600" }
        );

        // Seed default devices
        modelBuilder.Entity<Device>().HasData(
            new Device { Id = 1, Name = "Admin-PC-01", Ip = "192.168.10.5", Type = "PC", VlanId = 1 },
            new Device { Id = 2, Name = "Admin-Srv", Ip = "192.168.10.10", Type = "SERVER", VlanId = 1 },
            new Device { Id = 3, Name = "Ventas-Laptop", Ip = "192.168.20.5", Type = "PC", VlanId = 2 },
            new Device { Id = 4, Name = "Cam-Frontal", Ip = "192.168.30.15", Type = "IOT", VlanId = 3 },
            new Device { Id = 5, Name = "WebServer", Ip = "172.16.1.5", Type = "SERVER", VlanId = 4 }
        );

        // Seed default ACL rules
        modelBuilder.Entity<AclRule>().HasData(
            new AclRule
            {
                Id = 1,
                SourceVlanId = 10,
                DestinationVlanId = 99,
                Protocol = "ANY",
                Action = "PERMITIR",
                Description = "Admin acceso total a DMZ",
                Priority = 1,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new AclRule
            {
                Id = 2,
                SourceVlanId = 20,
                DestinationVlanId = 99,
                Protocol = "TCP",
                Action = "PERMITIR",
                Description = "Ventas acceso Web a DMZ",
                Priority = 2,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new AclRule
            {
                Id = 3,
                SourceVlanId = 30,
                DestinationVlanId = 10,
                Protocol = "ANY",
                Action = "BLOQUEAR",
                Description = "IoT no puede acceder a Admin",
                Priority = 3,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
