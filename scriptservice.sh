#!/bin/bash

echo_info () {
    echo "$1"
}

# Updating packages
sudo apt update && sudo apt upgrade -y

# Installing node server
sudo apt install -y nodejs npm

# Installing unzip
sudo apt install -y unzip

# Uninstalling git
sudo apt-get remove --purge -y git

# Installing PostgreSQL Client
sudo apt install postgresql-client -y

# Installing dig
sudo apt install dnsutils -y

# Cloudwatch agent installation and configuration
sudo wget https://s3.amazonaws.com/amazoncloudwatch-agent/debian/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i ./amazon-cloudwatch-agent.deb 
sudo apt-get -f install
sudo mv /home/admin/cloudwatch-config.json /opt/cloudwatch-config.json

# Creating new user and giving ownership to the webapp directory
sudo groupadd pramodgroup
sudo useradd -s /bin/false -g pramodgroup -d /opt/pramodhome -m pramod
sudo chown -R pramod:pramodgroup /opt/pramodhome/
sudo chmod -R 775 /opt/pramodhome/
sudo chmod g+s /opt/pramodhome/

# Moving weapp.zip to /opt/pramodhome and installing node modules
sudo mv /home/admin/webapp.zip /opt/pramodhome/
cd /opt/pramodhome/
sudo unzip webapp.zip
sudo rm webapp.zip

# Creating log file
sudo touch /var/log/csye6225.log
sudo chown -R pramod:pramodgroup /var/log/csye6225.log
sudo chmod 750 /var/log/csye6225.log

# Installing node modules
sudo mv /opt/pramodhome/webapp/users.csv /opt/
cd /opt/pramodhome/webapp
sudo npm i

# Systemd
sudo cp /home/admin/webapp.service /etc/systemd/system/

# Final permission changes
sudo chown pramod:pramodgroup /etc/systemd/system/webapp.service
sudo chmod 750 /etc/systemd/system/webapp.service
sudo chown -R pramod:pramodgroup /opt/pramodhome/
sudo chmod -R 750 /opt/pramodhome/webapp

# Starting the service
sudo systemctl daemon-reload
sudo systemctl enable webapp
sudo systemctl start webapp
sudo systemctl status webapp

# Installing rsyslog for audit logs
sudo apt install -y rsyslog
sudo systemctl daemon-reload