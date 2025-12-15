resource "supabase_project" "uxie" {
    organization_id = var.organization_id
    name = "uxie"
    region = "ap-southeast-1"
    database_password = var.database_password
}

resource "supabase_settings" "uxie" {
    project_ref = supabase_project.uxie.id
}


data "supabase_apikeys" "production" {
  project_ref = supabase_project.uxie.id
}