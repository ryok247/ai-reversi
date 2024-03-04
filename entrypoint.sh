#!/bin/sh

# collect static files
python manage.py collectstatic --noinput

# Apply database migrations
python manage.py makemigrations loginApp
python manage.py migrate

# Start Gunicorn
exec gunicorn loginProject.wsgi:application --bind 0.0.0.0:8000
