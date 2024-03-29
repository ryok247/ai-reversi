# You should run this code after cloning.
# You should also set up an .env or similar file
# Then you can start up servers using docker-compose

# manually run this command because it requires user input
# sudo apt-get install postgresql-client

sudo chmod 600 .env
sudo apt install -y docker.io
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo usermod -aG docker $USER
sudo apt install postgresql-client-common
sudo apt-get install postgresql-client-14
