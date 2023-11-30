# You should run this code after cloning.
# You should also set up an .env or similar file
# Then you can start up servers using docker-compose

sudo chmod 600 .env
sudo apt install -y docker.io
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo usermod -aG docker $USER
exit
