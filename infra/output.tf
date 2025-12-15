output "backend_url" {
    value = "${supabase_project.uxie.id}.supabase.co"
}

output "frontend_url" {
    value = "${vercel_project.uxie.name}.vercel.app"
}

output "ai_url" {
    value = "${vercel_project.ai.name}.vercel.app"
}
