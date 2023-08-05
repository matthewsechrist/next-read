terraform {
  required_providers {
    aws = {
      source     = "hashicorp/aws"
      version    = "~> 3.0"
    }
  }
  # Using Terraform Cloud to save Workflow states 
  backend "remote" {
    organization = "matthewsechrist"

    workspaces {
      name       = "cloud_resume_back_end"
    }
  }
}

provider "aws" {
  region         = "us-east-1"
}
