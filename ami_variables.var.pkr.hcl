variable "name" {
  type    = string
  default = "csye6225"
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "region" {
  type        = string
  default     = "us-east-1"
  description = "Region where EC2 should be deployed"
}

variable "source_ami" {
  type    = string
  default = "ami-06db4d78cb1d3bbf9" # Debian 12
}

variable "ssh_username" {
  type    = string
  default = "admin"
}

variable "vpc_id" {
  type    = string
  default = "vpc-06b513f1f8f191e5f"
}

variable "subnet_id" {
  type    = string
  default = "subnet-0389b04f24f0773b1"
}


variable "ami_regions" {
  type        = list(string)
  default     = ["us-east-1"]
  description = "Regions where AMI should be copied"
}