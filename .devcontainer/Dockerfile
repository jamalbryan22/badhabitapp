# Use a Debian base image
FROM mcr.microsoft.com/mssql/server:2019-latest

# Set environment variables for SQL Server
ENV ACCEPT_EULA=Y
ENV MSSQL_PID=Express
ENV SA_PASSWORD=$SA_PASSWORD  # Use the secret here

# Expose SQL Server port
EXPOSE 1433

# Start SQL Server
CMD ["/opt/mssql/bin/sqlservr"]
