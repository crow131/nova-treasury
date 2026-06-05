using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
using backend_api.Domain;

namespace backend_api.Services
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }

        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            var problemDetails = new ProblemDetails
            {
                Instance = httpContext.Request.Path
            };

            if (exception is NotFoundException notFoundEx)
            {
                problemDetails.Status = StatusCodes.Status404NotFound;
                problemDetails.Title = "Not Found";
                problemDetails.Detail = notFoundEx.Message;
                problemDetails.Type = "https://tools.ietf.org/html/rfc9110#section-15.5.5";
                _logger.LogWarning("Resource not found in request {Path}: {Message}", httpContext.Request.Path, notFoundEx.Message);
            }
            else if (exception is BusinessRuleException businessRuleEx)
            {
                problemDetails.Status = StatusCodes.Status400BadRequest;
                problemDetails.Title = "Business Rule Violation";
                problemDetails.Detail = businessRuleEx.Message;
                problemDetails.Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1";
                _logger.LogWarning("Business rule violation in request {Path}: {Message}", httpContext.Request.Path, businessRuleEx.Message);
            }
            else
            {
                problemDetails.Status = StatusCodes.Status500InternalServerError;
                problemDetails.Title = "Internal Server Error";
                problemDetails.Detail = "An unexpected error occurred during processing. Please contact support.";
                problemDetails.Type = "https://tools.ietf.org/html/rfc9110#section-15.6.1";
                _logger.LogError(exception, "An unhandled exception occurred in the Nova Treasury engine: {Message}", exception.Message);
            }

            httpContext.Response.StatusCode = problemDetails.Status.Value;
            httpContext.Response.ContentType = "application/json";

            await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

            return true; // We handled the response
        }
    }
}
