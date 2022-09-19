terraform {
  backend "s3" {
    bucket         = "ppb-tf-state-store"
    key            = "terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "ppb-tf-state-lock"
  }
}