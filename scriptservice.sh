#!/bin/bash

echo_info () {
    echo "$1"
}

# Updating packages
echo_info "UPDATES-BEING-INSTALLED"
sudo apt update && sudo apt upgrade -y


# Installing node server
echo_info "INSTALLING-NODEJS"
sudo apt install -y nodejs npm


# Installing unzip
echo_info "INSTALLING-UNZIP"
sudo apt install -y unzip


# Uninstalling git
sudo apt-get remove --purge -y git


# Creating new user and giving ownership to the webapp directory
sudo groupadd pramodgroup
sudo useradd -s /bin/false -g pramodgroup -d /opt/pramodhome -m pramod
sudo chmod -R 755 /opt/pramodhome/webapp


# Moving weapp.zip to /opt/pramodhome and installing node modules
sudo mv /home/admin/webapp.zip /opt/pramodhome/
cd /opt/pramodhome
sudo unzip webapp.zip
sudo rm webapp.zip
sudo mv /opt/pramodhome/webapp/users.csv /opt/
cd /opt/pramodhome/webapp
sudo npm i


# Starting the service
sudo sh -c "echo '[Unit]
Description=My NPM Service
Requires=cloud-init.target
After=cloud-final.service

[Service]
EnvironmentFile=/etc/environment
Type=simple
User=pramod
WorkingDirectory=/opt/pramodhome/webapp
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10

[Install]
WantedBy=cloud-init.target' | sudo tee /etc/systemd/system/webapp.service"

sudo systemctl daemon-reload
sudo systemctl enable webapp
sudo systemctl start webapp
sudo systemctl status webapp