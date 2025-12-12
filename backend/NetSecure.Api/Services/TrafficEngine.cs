using NetSecure.Api.Models.DTOs;

namespace NetSecure.Api.Services;

public interface ITrafficEngine
{
    TrafficSimulationResponse Simulate(TrafficSimulationRequest request);
}

public class TrafficEngine : ITrafficEngine
{
    private readonly Random _random = new();

    public TrafficSimulationResponse Simulate(TrafficSimulationRequest request)
    {
        // 1. Find source and destination VLANs and devices
        var srcVlan = request.Vlans.FirstOrDefault(v =>
            v.Devices.Any(d => d.Id.ToString() == request.SrcId || d.Name == request.SrcId));
        var dstVlan = request.Vlans.FirstOrDefault(v =>
            v.Devices.Any(d => d.Id.ToString() == request.DstId || d.Name == request.DstId));

        if (srcVlan == null || dstVlan == null)
        {
            return CreateResponse(request, "BLOCKED", "Dispositivo no encontrado en topología");
        }

        var srcDevice = srcVlan.Devices.FirstOrDefault(d =>
            d.Id.ToString() == request.SrcId || d.Name == request.SrcId);
        var dstDevice = dstVlan.Devices.FirstOrDefault(d =>
            d.Id.ToString() == request.DstId || d.Name == request.DstId);

        if (srcDevice == null || dstDevice == null)
        {
            return CreateResponse(request, "BLOCKED", "Dispositivo no encontrado");
        }

        // 2. Check intra-VLAN (same VLAN = L2 switching, always allowed)
        if (srcVlan.VlanId == dstVlan.VlanId)
        {
            var intraResult = CheckUtm(request.Utm, request.Protocol);
            if (intraResult != null)
            {
                return CreateResponse(request, srcDevice, dstDevice, srcVlan, dstVlan,
                    "UTM_BLOCKED", intraResult);
            }
            return CreateResponse(request, srcDevice, dstDevice, srcVlan, dstVlan,
                "SUCCESS", "Tráfico local (Misma VLAN - Switching L2)");
        }

        // 3. Check ACL rules (inter-VLAN routing)
        var matchingRule = request.Acls
            .Where(acl => acl.SrcVlanId == srcVlan.VlanId && acl.DstVlanId == dstVlan.VlanId)
            .Where(acl => acl.Protocol == "ANY" || acl.Protocol == request.Protocol)
            .FirstOrDefault();

        if (matchingRule != null)
        {
            if (matchingRule.Action == "PERMITIR" || matchingRule.Action == "ALLOW")
            {
                // Check UTM before allowing
                var utmResult = CheckUtm(request.Utm, request.Protocol);
                if (utmResult != null)
                {
                    return CreateResponse(request, srcDevice, dstDevice, srcVlan, dstVlan,
                        "UTM_BLOCKED", utmResult);
                }
                return CreateResponse(request, srcDevice, dstDevice, srcVlan, dstVlan,
                    "SUCCESS", $"Permitido por regla ACL ID {matchingRule.Id}");
            }
            else
            {
                return CreateResponse(request, srcDevice, dstDevice, srcVlan, dstVlan,
                    "BLOCKED", $"Denegado por regla ACL ID {matchingRule.Id}");
            }
        }

        // 4. Implicit deny (no matching rule)
        return CreateResponse(request, srcDevice, dstDevice, srcVlan, dstVlan,
            "BLOCKED", "Bloqueo implícito (Sin regla coincidente)");
    }

    private string? CheckUtm(UtmFeaturesDto utm, string protocol)
    {
        // IPS simulation - 20% chance of detecting "threat" when enabled
        if (utm.Ips && _random.NextDouble() > 0.8)
        {
            return "Amenaza detectada por IPS (Simulación)";
        }

        // Antivirus simulation - 10% chance when enabled
        if (utm.Av && _random.NextDouble() > 0.9)
        {
            return "Malware detectado por Antivirus Gateway (Simulación)";
        }

        // Web Filter simulation - 15% chance for TCP when enabled
        if (utm.WebFilter && protocol == "TCP" && _random.NextDouble() > 0.85)
        {
            return "Contenido bloqueado por Web Filter (Simulación)";
        }

        return null; // No threats detected
    }

    private static TrafficSimulationResponse CreateResponse(
        TrafficSimulationRequest request,
        string result,
        string reason)
    {
        return new TrafficSimulationResponse(
            Id: Guid.NewGuid().ToString(),
            Timestamp: DateTime.Now.ToString("HH:mm:ss"),
            SrcDevice: request.SrcId,
            SrcVlan: "Unknown",
            DstDevice: request.DstId,
            DstVlan: "Unknown",
            Protocol: request.Protocol,
            Result: result,
            Reason: reason
        );
    }

    private static TrafficSimulationResponse CreateResponse(
        TrafficSimulationRequest request,
        DeviceDto srcDevice,
        DeviceDto dstDevice,
        VlanDto srcVlan,
        VlanDto dstVlan,
        string result,
        string reason)
    {
        return new TrafficSimulationResponse(
            Id: Guid.NewGuid().ToString(),
            Timestamp: DateTime.Now.ToString("HH:mm:ss"),
            SrcDevice: srcDevice.Name,
            SrcVlan: $"VLAN {srcVlan.VlanId}",
            DstDevice: dstDevice.Name,
            DstVlan: $"VLAN {dstVlan.VlanId}",
            Protocol: request.Protocol,
            Result: result,
            Reason: reason
        );
    }
}
