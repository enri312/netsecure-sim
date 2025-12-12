export const generateCSharpCode = () => {
  return `// --- Copia este código en tu proyecto .NET 10 ---

using System.Text.Json.Serialization;

namespace NetSecure.Core.Models;

// Enums
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Protocol { TCP, UDP, ICMP, ANY }

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum NetworkAction { ALLOW, DENY } // Renamed from Action to avoid System.Action conflict

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum SimulationResult { SUCCESS, BLOCKED, UTM_BLOCKED }

// Models / DTOs
public record Device(
    string Id,
    string Name,
    string Ip,
    string Type
);

public record Vlan(
    string Id,
    int VlanId,
    string Name,
    string Subnet,
    string Color,
    List<Device> Devices
);

public record AclRule(
    string Id,
    int SrcVlanId,
    int DstVlanId,
    Protocol Protocol,
    NetworkAction Action,
    string Description
);

public record UtmFeatures(
    bool Ips,
    bool Av,
    bool WebFilter
);

// Request Object
public record TrafficContextRequest(
    string SrcId,
    string DstId,
    Protocol Protocol,
    List<Vlan> Vlans,
    List<AclRule> Acls,
    UtmFeatures Utm
);

// Response Object
public record SimulationLogResponse(
    string Id,
    string Timestamp,
    string SrcDevice,
    string SrcVlan,
    string DstDevice,
    string DstVlan,
    Protocol Protocol,
    SimulationResult Result,
    string Reason
);

// --- Controller Example ---

using Microsoft.AspNetCore.Mvc;

namespace NetSecure.Api.Controllers;

[ApiController]
[Route("api/simulation")]
public class SimulationController : ControllerBase
{
    [HttpPost]
    public ActionResult<SimulationLogResponse> RunSimulation([FromBody] TrafficContextRequest request)
    {
        // 1. Reconstruir lógica de negocio aquí usando Services
        // var result = _trafficEngine.Evaluate(request);
        
        // Mock Response para pruebas de conexión
        return Ok(new SimulationLogResponse(
            Id: Guid.NewGuid().ToString(),
            Timestamp: DateTime.Now.ToShortTimeString(),
            SrcDevice: "RemoteDevice",
            SrcVlan: "VLAN-NET",
            DstDevice: "RemoteTarget",
            DstVlan: "VLAN-NET",
            Protocol: request.Protocol,
            Result: SimulationResult.SUCCESS,
            Reason: "Procesado exitosamente por .NET 10 Core"
        ));
    }
}`;
};