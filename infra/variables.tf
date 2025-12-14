variable "organization_id" {
    type = string
    description = "The ID of the organization"
}

variable "database_password" {
    type = string
    description = "The password of the database"
    sensitive = true
}

variable "supabase_access_token" {
    type = string
    description = "The access token of the supabase"
    sensitive = true
}

variable "groq_api_key" {
    type = string
    description = "The API key of the groq"
    sensitive = true
}

variable "vercel_api_token" {
    type = string
    description = "The API token of the vercel"
    sensitive = true
}