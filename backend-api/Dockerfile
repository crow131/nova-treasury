FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["backend-api.csproj", "./"]
RUN dotnet restore "./backend-api.csproj"

# Copy all source files and build
COPY . .
RUN dotnet build "backend-api.csproj" -c Release -o /app/build
RUN dotnet publish "backend-api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Default ASP.NET Core port in .NET 8+ containers is 8080
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Development

ENTRYPOINT ["dotnet", "backend-api.dll"]
