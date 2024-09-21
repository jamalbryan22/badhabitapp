using Microsoft.EntityFrameworkCore;
using BadHabitApp.Models;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Add MVC Controllers and Views
builder.Services.AddControllersWithViews();

// Configure Entity Framework (From Startup.cs)
builder.Services.AddDbContext<AppDbContext>(options =>
	options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add any additional services here (e.g., Identity, authentication, authorization, etc.)

// Build the app
var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
} else
{
    // From Startup.cs for development
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthorization();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

app.Run();

