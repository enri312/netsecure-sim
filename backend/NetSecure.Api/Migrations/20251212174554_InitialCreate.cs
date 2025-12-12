using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace NetSecure.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AclRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SourceVlanId = table.Column<int>(type: "integer", nullable: false),
                    DestinationVlanId = table.Column<int>(type: "integer", nullable: false),
                    Protocol = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Action = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AclRules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Vlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VlanId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Subnet = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TrafficLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SourceDevice = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SourceVlan = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DestinationDevice = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DestinationVlan = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Protocol = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Result = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrafficLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrafficLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Devices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Ip = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    VlanId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Devices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Devices_Vlans_VlanId",
                        column: x => x.VlanId,
                        principalTable: "Vlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "AclRules",
                columns: new[] { "Id", "Action", "CreatedAt", "Description", "DestinationVlanId", "Priority", "Protocol", "SourceVlanId" },
                values: new object[,]
                {
                    { 1, "PERMITIR", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Admin acceso total a DMZ", 99, 1, "ANY", 10 },
                    { 2, "PERMITIR", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Ventas acceso Web a DMZ", 99, 2, "TCP", 20 },
                    { 3, "BLOQUEAR", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "IoT no puede acceder a Admin", 10, 3, "ANY", 30 }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "LastLogin", "PasswordHash", "Role", "Username" },
                values: new object[] { 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "$2a$11$D1HaR75k6pj6riZMp9rPSut5QAJUUTb7PgLloblA74sz7osAG7de.", "admin", "CENV" });

            migrationBuilder.InsertData(
                table: "Vlans",
                columns: new[] { "Id", "Color", "Name", "Subnet", "VlanId" },
                values: new object[,]
                {
                    { 1, "bg-emerald-600", "Administración", "192.168.10.0/24", 10 },
                    { 2, "bg-blue-600", "Ventas", "192.168.20.0/24", 20 },
                    { 3, "bg-orange-600", "IoT / Cámaras", "192.168.30.0/24", 30 },
                    { 4, "bg-purple-600", "Servidores DMZ", "172.16.1.0/24", 99 }
                });

            migrationBuilder.InsertData(
                table: "Devices",
                columns: new[] { "Id", "Ip", "Name", "Type", "VlanId" },
                values: new object[,]
                {
                    { 1, "192.168.10.5", "Admin-PC-01", "PC", 1 },
                    { 2, "192.168.10.10", "Admin-Srv", "SERVER", 1 },
                    { 3, "192.168.20.5", "Ventas-Laptop", "PC", 2 },
                    { 4, "192.168.30.15", "Cam-Frontal", "IOT", 3 },
                    { 5, "172.16.1.5", "WebServer", "SERVER", 4 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Devices_VlanId",
                table: "Devices",
                column: "VlanId");

            migrationBuilder.CreateIndex(
                name: "IX_TrafficLogs_Timestamp",
                table: "TrafficLogs",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_TrafficLogs_UserId",
                table: "TrafficLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vlans_VlanId",
                table: "Vlans",
                column: "VlanId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AclRules");

            migrationBuilder.DropTable(
                name: "Devices");

            migrationBuilder.DropTable(
                name: "TrafficLogs");

            migrationBuilder.DropTable(
                name: "Vlans");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
