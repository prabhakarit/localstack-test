terraform {
  backend "s3" {
    bucket         = "ppb-tf-state-store"
    key            = "terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "tf-state-lock"
  }
}

resource "aws_s3_bucket" "test-bucket" {
  bucket = "very-random-ppb-bucket-1"
}
