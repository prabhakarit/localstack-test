##############################################
## Network Single AZ Public Only - Variables #
##############################################

variable "environment" {
  type        = string
  description = "environment"
  default = "test"
}

# AWS AZ
variable "availability_zones" {
  type        = string
  description = "AWS AZ a ?"
  default     = "ap-south-1a"
}

# VPC Variables
variable "vpc_cidr" {
  type        = string
  description = "CIDR for the VPC"
  default     = "10.0.0.0/16"
}

# Subnet Variables
variable "public_subnets_cidr" {
  type        = string
  description = "CIDR for the public subnet"
  default     = "10.0.2.0/24"
}

# Subnet Variables
variable "private_subnets_cidr" {
  type        = string
  description = "CIDR for the private subnet"
  default     = "10.0.3.0/24"
}

variable "vpc_enable_nat_gateway" {
  description = "Enable NAT gateway for VPC"
  type        = bool
  default     = true
}

variable "vpc_tags" {
  description = "Tags to apply to resources created by VPC module"
  type        = map(string)
  default = {
    Terraform   = "true"
    Environment = "dev"
  }
}
