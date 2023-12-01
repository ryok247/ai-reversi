#!/bin/sh

# collect static files
python manage.py collectstatic --noinput

python manage.py makemigrations loginApp
python manage.py migrate

python manage.py runserver 0.0.0.0:8000