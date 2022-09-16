terraform {
  backend "s3" {
    bucket         = "ppb-tf-state-store"
    key            = "terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "tf-state-lock"
  }
}

# S3
resource "aws_s3_bucket" "test-bucket" {
  bucket = "very-random-ppb-bucket-1"
}

# VPC
resource "aws_vpc" "vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.environment}-vpc"
    Environment = "${var.environment}"
  }
}

# Subnets
# Internet Gateway for Public Subnet
resource "aws_internet_gateway" "ig" {
  vpc_id = aws_vpc.vpc.id
  tags = {
    Name        = "${var.environment}-igw"
    Environment = "${var.environment}"
  }
}

# Elastic-IP (eip) for NAT
resource "aws_eip" "nat_eip" {
  vpc        = true
  depends_on = [aws_internet_gateway.ig]
}

# Public subnet
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.vpc.id
  count                   = 1
  cidr_block              = "${var.public_subnets_cidr}"
  availability_zone       = "${var.availability_zones}"
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.environment}-${var.availability_zones}-public-subnet"
    Environment = "${var.environment}"
  }
}


# Private Subnet
resource "aws_subnet" "private_subnet" {
  vpc_id                  = aws_vpc.vpc.id
  count                   = 1
  cidr_block              = "${var.private_subnets_cidr}"
  availability_zone       = "${var.availability_zones}"
  map_public_ip_on_launch = false

  tags = {
    Name        = "${var.environment}-${var.availability_zones}-private-subnet"
    Environment = "${var.environment}"
  }
}

# Routing tables to route traffic for Private Subnet
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name        = "${var.environment}-private-route-table"
    Environment = "${var.environment}"
  }
}

# Routing tables to route traffic for Public Subnet
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name        = "${var.environment}-public-route-table"
    Environment = "${var.environment}"
  }
}

# Route for Internet Gateway
resource "aws_route" "public_internet_gateway" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.ig.id
}

# Route table associations for both Public & Private Subnets
resource "aws_route_table_association" "public" {
  count          = 1
  subnet_id      = aws_subnet.public_subnet[0].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = 1
  subnet_id      = aws_subnet.private_subnet[0].id
  route_table_id = aws_route_table.private.id
}

# Default Security Group of VPC
resource "aws_security_group" "default" {
  name        = "${var.environment}-default-sg"
  description = "Default SG to alllow traffic from the VPC"
  vpc_id      = aws_vpc.vpc.id
  depends_on = [
    aws_vpc.vpc
  ]

    ingress {
    from_port = "0"
    to_port   = "0"
    protocol  = "-1"
    self      = true
  }

  egress {
    from_port = "0"
    to_port   = "0"
    protocol  = "-1"
    self      = "true"
  }

  tags = {
    Environment = "${var.environment}"
  }
}
