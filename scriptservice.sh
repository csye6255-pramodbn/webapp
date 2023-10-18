#!/bin/bash

echo_info () {
    echo "$1"
}

# Updating packages
echo_info "UPDATES-BEING-INSTALLED"
sudo apt update && sudo apt upgrade -y

source ~/.bashrc

# Installing node server
echo_info "INSTALLING-NODEJS"
sudo apt install -y nodejs npm

# Installing PostgresSQL
echo_info "INSTALLING-POSTGRESQL"
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'pramod';"
sudo -u postgres createdb db1


# Installing unzip
echo_info "INSTALLING-UNZIP"
sudo apt install -y unzip

# Uninstalling git
sudo apt-get remove --purge -y git


cd /opt
unzip webapp.zip
rm webapp.zip
cd webapp
mv users.csv /opt/
npm i

sudo sh -c "echo '[Unit]
Description=My NPM Service
After=network.target

[Service]
User=admin
WorkingDirectory=/opt/webapp
ExecStart=/usr/bin/npm run start
Restart=always

[Install]
WantedBy=multi-user.target' | sudo tee /etc/systemd/system/webapp.service"

sudo systemctl daemon-reload
sudo systemctl enable webapp
sudo systemctl start webapp
sudo systemctl status webapp
