using Microsoft.AspNetCore.Mvc;
using System;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;

namespace backend_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OsintController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetOsintDetails()
        {
            try
            {
                var currentProcess = Process.GetCurrentProcess();
                var uptime = DateTime.UtcNow - currentProcess.StartTime.ToUniversalTime();
                
                string hostName = Dns.GetHostName();
                var localIps = Dns.GetHostEntry(hostName).AddressList
                    .Where(ip => ip.AddressFamily == AddressFamily.InterNetwork)
                    .Select(ip => ip.ToString())
                    .ToList();

                var details = new
                {
                    Username = Environment.UserName,
                    MachineName = Environment.MachineName,
                    OsDescription = RuntimeInformation.OSDescription,
                    OsArchitecture = RuntimeInformation.OSArchitecture.ToString(),
                    ProcessArchitecture = RuntimeInformation.ProcessArchitecture.ToString(),
                    FrameworkDescription = RuntimeInformation.FrameworkDescription,
                    WorkingDirectory = Environment.CurrentDirectory,
                    ProcessId = currentProcess.Id,
                    ProcessName = currentProcess.ProcessName,
                    ProcessUptime = $"{uptime.Days}d {uptime.Hours}h {uptime.Minutes}m {uptime.Seconds}s",
                    LocalIps = localIps
                };

                return Ok(details);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { detail = $"Failed to gather OSINT telemetry: {ex.Message}" });
            }
        }
    }
}
