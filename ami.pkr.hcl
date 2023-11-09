packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.1"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

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

variable "ami_users" {
  type        = list(string)
  default     = ["605235953341", "201635325056"]
  description = "AMIS will be shared to Dev and Demo account"
}

# https://www.packer.io/plugins/builders/amazon/ebs
source "amazon-ebs" "webapp" {
  ami_name              = "${var.name}_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  ami_description       = "AMI for CSYE 6225"
  region                = "${var.region}"
  ami_users             = "${var.ami_users}"
  force_deregister      = true
  force_delete_snapshot = true
  ami_regions           = "${var.ami_regions}"

  aws_polling {
    delay_seconds = 30
    max_attempts  = 50
  }

  instance_type = "${var.instance_type}"
  source_ami    = "${var.source_ami}"
  ssh_username  = "${var.ssh_username}"
  vpc_id        = "${var.vpc_id}"
  subnet_id     = "${var.subnet_id}"


  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/xvda"
    volume_size           = 8
    volume_type           = "gp2"
  }

}


build {
  sources = ["source.amazon-ebs.webapp"]

  provisioner "file" {
    source      = "webapp.zip"
    destination = "/home/admin/webapp.zip"
  }

  provisioner "file" {
    source      = "webapp.service"
    destination = "/home/admin/webapp.service"
  }

  provisioner "file" {
    source      = "cloudwatch-config.json"
    destination = "/home/admin/cloudwatch-config.json"
  }

  provisioner "shell" {
    environment_vars = [
      "CHECKPOINT_DISABLE=1",
      "DEBIAN_FRONTEND=noninteractive"
    ]
    scripts = [
      "scriptservice.sh"
    ]
  }
}