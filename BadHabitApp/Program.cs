using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BadHabitApp.Data;
using BadHabitApp.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
	options.TokenValidationParameters = new TokenValidationParameters
	{
		ValidateIssuer = true,
		ValidateAudience = true,
		ValidateLifetime = true,
		ValidateIssuerSigningKey = true,
		ValidIssuer = "BadHabitApp.net",
		ValidAudience = "BadHabitApp.net",
		IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("supersecretkey"))
	};
});

// Add CORS
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowAll",
		policy => policy.AllowAnyOrigin()
						.AllowAnyMethod()
						.AllowAnyHeader());
});

// Add MVC Controllers and Views
builder.Services.AddControllersWithViews();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<AuthService>();
builder.Services.AddDbContext<AppDbContext>(options =>
	options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add any additional services here (e.g., Identity, authentication, authorization, etc.)

// Build the app
var app = builder.Build();

// Ensure database is created and seed data is added
using (var scope = app.Services.CreateScope())
{
	var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
	context.Database.Migrate();
	AppDbContext.Seed(context);
}

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



app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "v1"));

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

app.Run();

