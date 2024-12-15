# Use a lightweight Nginx base image
FROM nginx:alpine

# Copy static site content to the Nginx HTML folder
COPY . /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80

