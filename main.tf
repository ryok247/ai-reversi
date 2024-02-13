provider "aws" {
    region = "ap-northeast-1"
  }
  
  resource "aws_vpc" "my_vpc" {
    cidr_block = "10.0.0.0/16"
  }
  
  resource "aws_subnet" "my_subnet_a" {
    vpc_id                  = aws_vpc.my_vpc.id
    cidr_block              = "10.0.1.0/24"
    availability_zone       = "ap-northeast-1a"
    map_public_ip_on_launch = true
  }
  
  resource "aws_subnet" "my_subnet_b" {
    vpc_id                  = aws_vpc.my_vpc.id
    cidr_block              = "10.0.2.0/24"
    availability_zone       = "ap-northeast-1c"
    map_public_ip_on_launch = true
  }
  
  resource "aws_db_subnet_group" "my_db_subnet_group" {
    name       = "my-db-subnet-group"
    subnet_ids = [aws_subnet.my_subnet_a.id, aws_subnet.my_subnet_b.id]
  }
  
  resource "aws_security_group" "ec2_sg" {
    vpc_id = aws_vpc.my_vpc.id
  
    ingress {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  
    ingress {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  
    ingress {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  
    egress {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }
  
  resource "aws_security_group" "rds_sg" {
    vpc_id = aws_vpc.my_vpc.id
  
    ingress {
      from_port       = 5432
      to_port         = 5432
      protocol        = "tcp"
      security_groups = [aws_security_group.ec2_sg.id]
    }
  }
  
  resource "aws_db_instance" "postgres_db" {
    allocated_storage      = 10
    storage_type           = "gp2"
    engine                 = "postgres"
    engine_version         = "15.4"
    instance_class         = "db.t3.micro"
    identifier             = "ai-reversi-postgre"
    username               = "db_rds_admin"
    password               = random_password.password.result
    db_subnet_group_name   = aws_db_subnet_group.my_db_subnet_group.name
    vpc_security_group_ids = [aws_security_group.rds_sg.id]
    skip_final_snapshot    = true
    multi_az               = true
  }
  
  resource "random_password" "password" {
    length           = 16
    special          = true
    override_special = "!#$%&()*+,-.:;<=>?[]^_{|}~"
  }  
  
  resource "aws_secretsmanager_secret" "rds_secret" {
    name = "ai-reversi-db-secret"
  }
  
  resource "aws_secretsmanager_secret_version" "rds_secret_version" {
    secret_id     = aws_secretsmanager_secret.rds_secret.id
    secret_string = "{\"password\": \"${random_password.password.result}\", \"username\": \"db_rds_admin\"}"
  }
  
  resource "aws_internet_gateway" "my_igw" {
    vpc_id = aws_vpc.my_vpc.id
  }
  
  resource "aws_route_table" "my_route_table" {
    vpc_id = aws_vpc.my_vpc.id
  
    route {
      cidr_block = "0.0.0.0/0"
      gateway_id = aws_internet_gateway.my_igw.id
    }
  }
  
  resource "aws_route_table_association" "a" {
    subnet_id      = aws_subnet.my_subnet_a.id
    route_table_id = aws_route_table.my_route_table.id
  }
  
  resource "aws_route_table_association" "b" {
    subnet_id      = aws_subnet.my_subnet_b.id
    route_table_id = aws_route_table.my_route_table.id
  }
  
  resource "aws_lb" "ai_reversi_lb" {
    name               = "ai-reversi"
    internal           = false
    load_balancer_type = "application"
    security_groups    = [aws_security_group.ec2_sg.id]
    subnets            = [aws_subnet.my_subnet_a.id, aws_subnet.my_subnet_b.id]
  
    enable_deletion_protection = false
  }
  
  resource "aws_lb_listener" "ai_reversi_listener" {
    load_balancer_arn = aws_lb.ai_reversi_lb.arn
    port              = 443
    protocol          = "HTTPS"
    ssl_policy        = "ELBSecurityPolicy-2016-08"
    certificate_arn   = "arn:aws:acm:ap-northeast-1:099119496071:certificate/dec32abb-d8aa-40ef-b314-f7434304c1d0"
  
    default_action {
      type             = "forward"
      target_group_arn = aws_lb_target_group.ai_reversi_tg.arn
    }
  }
  
  resource "aws_lb_target_group" "ai_reversi_tg" {
    name     = "ai-reversi-tg"
    port     = 80
    protocol = "HTTP"
    vpc_id   = aws_vpc.my_vpc.id
  }
  
  resource "aws_launch_configuration" "ai_reversi_lc" {
    name          = "ai-reversi-lc"
    image_id      = "ami-09a81b370b76de6a2"
    instance_type = "t2.micro"
    security_groups = [aws_security_group.ec2_sg.id]
    key_name = "ai-reversi"
  }
  
  resource "aws_autoscaling_group" "ai_reversi_asg" {
    launch_configuration = aws_launch_configuration.ai_reversi_lc.name
    min_size             = 1
    max_size             = 2
    desired_capacity     = 1
    vpc_zone_identifier  = [aws_subnet.my_subnet_a.id, aws_subnet.my_subnet_b.id]
    target_group_arns    = [aws_lb_target_group.ai_reversi_tg.arn]
  }
  
  resource "aws_route53_record" "ai_reversi_dns" {
    zone_id = "Z032605334SKM0XBBMJC0"
    name    = "ai-reversi.com"
    type    = "A"
    alias {
      name                   = aws_lb.ai_reversi_lb.dns_name
      zone_id                = aws_lb.ai_reversi_lb.zone_id
      evaluate_target_health = true
    }
  }
  