# Context: backend/
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

# Copy all files to ensure all project references are preserved with correct relative paths
COPY . .

# Restore and Publish the API project (this will automatically build dependencies)
RUN dotnet publish "src/EmployeeManagement.API/EmployeeManagement.API.csproj" -c Release -o /app/publish

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
ENTRYPOINT ["dotnet", "EmployeeManagement.API.dll"]
