namespace NetSecure.Api.Models;

/// <summary>
/// User entity for authentication
/// </summary>
public class User
{
    public int Id { get; set; }
    public required string Username { get; set; }
    public required string PasswordHash { get; set; }
    public required string Role { get; set; } // "admin" or "technician"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLogin { get; set; }
}

/// <summary>
/// Virtual LAN configuration
/// </summary>
public class Vlan
{
    public int Id { get; set; }
    public int VlanId { get; set; } // VLAN number (10, 20, 30, etc.)
    public required string Name { get; set; }
    public required string Subnet { get; set; } // e.g., "192.168.10.0/24"
    public required string Color { get; set; } // CSS class for display
    public ICollection<Device> Devices { get; set; } = new List<Device>();
}

/// <summary>
/// Network device within a VLAN
/// </summary>
public class Device
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Ip { get; set; }
    public required string Type { get; set; } // PC, SERVER, PRINTER, IOT
    public int VlanId { get; set; }
    public Vlan? Vlan { get; set; }
}

/// <summary>
/// Access Control List rule
/// </summary>
public class AclRule
{
    public int Id { get; set; }
    public int SourceVlanId { get; set; }
    public int DestinationVlanId { get; set; }
    public required string Protocol { get; set; } // TCP, UDP, ICMP, ANY
    public required string Action { get; set; } // PERMITIR, BLOQUEAR
    public required string Description { get; set; }
    public int Priority { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Traffic simulation log entry
/// </summary>
public class TrafficLog
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public required string SourceDevice { get; set; }
    public required string SourceVlan { get; set; }
    public required string DestinationDevice { get; set; }
    public required string DestinationVlan { get; set; }
    public required string Protocol { get; set; }
    public required string Result { get; set; } // SUCCESS, BLOCKED, UTM_BLOCKED
    public required string Reason { get; set; }
    public int? UserId { get; set; }
    public User? User { get; set; }
}

/// <summary>
/// UTM Firewall feature flags
/// </summary>
public class UtmFeatures
{
    public bool Ips { get; set; }
    public bool Av { get; set; }
    public bool WebFilter { get; set; }
}
