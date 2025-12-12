using System.Text.Json.Serialization;

namespace NetSecure.Api.Models.DTOs;

// ============ Authentication DTOs ============

public record LoginRequest(string Username, string Password);

public record LoginResponse(
    string Token,
    string Username,
    string Role,
    DateTime ExpiresAt
);

public record UserInfo(
    int Id,
    string Username,
    string Role
);

// ============ Network DTOs ============

public record VlanDto(
    int Id,
    int VlanId,
    string Name,
    string Subnet,
    string Color,
    List<DeviceDto> Devices
);

public record DeviceDto(
    int Id,
    string Name,
    string Ip,
    string Type
);

public record CreateDeviceRequest(
    string Name,
    string Ip,
    string Type,
    int VlanId
);

public record CreateVlanRequest(
    int VlanId,
    string Name,
    string Subnet,
    string Color
);

// ============ Firewall DTOs ============

public record AclRuleDto(
    int Id,
    int SrcVlanId,
    int DstVlanId,
    string Protocol,
    string Action,
    string Description
);

public record CreateAclRuleRequest(
    int SrcVlanId,
    int DstVlanId,
    string Protocol,
    string Action,
    string Description
);

// ============ Simulation DTOs ============

public record TrafficSimulationRequest(
    string SrcId,
    string DstId,
    string Protocol,
    List<VlanDto> Vlans,
    List<AclRuleDto> Acls,
    UtmFeaturesDto Utm
);

public record UtmFeaturesDto(
    bool Ips,
    bool Av,
    bool WebFilter
);

public record TrafficSimulationResponse(
    string Id,
    string Timestamp,
    string SrcDevice,
    string SrcVlan,
    string DstDevice,
    string DstVlan,
    string Protocol,
    string Result,
    string Reason
);

// ============ Log DTOs ============

public record TrafficLogDto(
    int Id,
    DateTime Timestamp,
    string SourceDevice,
    string SourceVlan,
    string DestinationDevice,
    string DestinationVlan,
    string Protocol,
    string Result,
    string Reason
);

public record LogFilterRequest(
    DateTime? From,
    DateTime? To,
    string? Protocol,
    string? Result,
    int Page = 1,
    int PageSize = 50
);

public record PaginatedResponse<T>(
    List<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);
