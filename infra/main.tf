terraform {
  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }

    vercel = {
      source = "vercel/vercel"
      version = "~> 0.3"
    }
  }
}

provider "supabase" {
    access_token = var.supabase_access_token
}