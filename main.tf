resource "aws_s3_bucket" "test-bucket" {
  bucket = "very-random-ppb-bucket-1"
}

resource "aws_iam_role" "invocation_role" {
  name = "api_gateway_auth_invocation"
  path = "/"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": {
    "Effect": "Allow",
    "Action": "s3:ListBucket",
    "Resource": "arn:aws:s3:::very-random-ppb-bucket-1"
  }
}
EOF
}
