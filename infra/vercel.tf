resource "vercel_project" "uxie" {
    name = "uxie"
    git_repository = {
        type = "github"
        repo = "mraihanaf/uxie"
    }
    root_directory = "apps/web"
}

resource "vercel_project" "ai" {
    name = "ai"
    git_repository = {
        type = "github"
        repo = "mraihanaf/uxie"
    }
    root_directory = "apps/ai"
}

resource "vercel_project_environment_variable" "supabase_url" {
    target = ["production"]
    project_id = vercel_project.uxie.id
    key = "NEXT_PUBLIC_SUPABASE_URL"
    value = "https://${supabase_project.uxie.id}.supabase.co"
}

resource "vercel_project_environment_variable" "publishable_default_key" {
    target = ["production"]
    project_id = vercel_project.uxie.id
    key = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"
    value = data.supabase_apikeys.production.anon_key
}

resource "vercel_project_environment_variable" "mastra_api_url" {
    target = ["production"]
    project_id = vercel_project.uxie.id
    key = "NEXT_PUBLIC_MASTRA_API_URL"
    value = "https://${vercel_project.ai.name}.vercel.app"
}

resource "vercel_project_environment_variable" "ai_allowed_origin" {
    target = ["production"]
    project_id = vercel_project.ai.id
    key = "ALLOWED_ORIGIN"
    value = "https://${vercel_project.uxie.name}.vercel.app"
}

resource "vercel_project_environment_variable" "ai_supabase_url" {
    target = ["production"]
    project_id = vercel_project.ai.id
    key = "SUPABASE_URL"
    value = "https://${supabase_project.uxie.id}.supabase.co"
}

resource "vercel_project_environment_variable" "ai_supabase_service_role_key" {
    target = ["production"]
    project_id = vercel_project.ai.id
    key = "SUPABASE_SERVICE_ROLE_KEY"
    value = data.supabase_apikeys.production.service_role_key
}

resource "vercel_project_environment_variable" "ai_libsql_url" {
    target = ["production"]
    project_id = vercel_project.ai.id
    key = "LIBSQL_URL"
    value = "file:./mastra.db"
}

resource "vercel_project_environment_variable" "ai_groq_api_key" {
    target = ["production"]
    project_id = vercel_project.ai.id
    key = "GROQ_API_KEY"
    value = var.groq_api_key
}