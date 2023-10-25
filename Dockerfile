# Use an official Apache base image from the Docker Hub
FROM httpd:2.4

# Copy your custom HTML file to the web server's document root
COPY . /usr/local/apache2/htdocs/