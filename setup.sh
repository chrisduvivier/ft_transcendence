#!/bin/bash

# install postgresql (psql (PostgreSQL) 14.2 (Ubuntu 14.2-1.pgdg18.04+1))
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get -y install postgresql

# ensure service is started
sudo systemctl start postgresql.service

# Need to define a password for the USER postgres
sudo passwd postgres

# Run init_db script as user postgres
# su postgres -c 'bash ./init_db.sh'

# -> a true nightmare to settup this service. Had to check https://stackoverflow.com/questions/53267642/create-new-local-server-in-pgadmin

# psql -U postgres -d transcendance -c "SELECT c_defaults  FROM user_info WHERE c_uid = 'testuser'"