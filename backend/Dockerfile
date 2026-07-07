FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy solution and project files
COPY backend/NetQuestAI.sln ./backend/
COPY backend/src/NetQuestAI.Api/NetQuestAI.Api.csproj ./backend/src/NetQuestAI.Api/
RUN dotnet restore ./backend/NetQuestAI.sln

# Copy everything and build release
COPY backend/ ./backend/
WORKDIR /app/backend/src/NetQuestAI.Api
RUN dotnet publish -c Release -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

EXPOSE 8080
ENTRYPOINT ["dotnet", "NetQuestAI.Api.dll"]
