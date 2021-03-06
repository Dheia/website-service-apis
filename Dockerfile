FROM ubuntu:16.04

ARG GITLAB_USER
ARG GITLAB_PASSWORD

# install dependencies
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		nginx \
	&& rm -r /var/lib/apt/lists/*

# Default command

# Install Node.js
RUN apt-get update \
	&& apt-get install --yes curl
RUN curl --silent --location https://deb.nodesource.com/setup_7.x | bash -
RUN apt-get install --yes nodejs
RUN apt-get install --yes build-essential
RUN npm install --global surge
RUN apt-get install --yes nano
RUN apt-get install --yes git
ADD .netrc /root
RUN echo "USER: $GITLAB_USER"
RUN echo "PASS: $GITLAB_PASSWORD"
RUN echo "     login $GITLAB_USER" >> /root/.netrc
RUN echo "     password $GITLAB_PASSWORD" >> /root/.netrc
RUN git config --global user.email " fsaiyed@officebrain.com"
RUN git config --global user.name "Faizan Saiyed"



# add project data
WORKDIR /opt/app
ADD . /opt/app
RUN npm install


# ssl certificate add
ADD cert /etc/ssl/cert
ADD privkey /etc/ssl/privkey


# make websites and plugins folder
RUN mkdir /var/www/html/websites
RUN mkdir /var/www/html/plugins

RUN cp -a -f /opt/app/plugins/* /var/www/html/plugins/

RUN mv /opt/app/package2.json /var/www/html/package.json

RUN cp /opt/app/nginx.conf /etc/nginx/sites-available/
RUN cp /opt/app/qa.conf /etc/nginx/sites-available/
RUN cp /opt/app/flowz.conf /etc/nginx/sites-available/
RUN cp /opt/app/distributor.conf /etc/nginx/sites-available/
RUN ln -s /etc/nginx/sites-available/nginx.conf /etc/nginx/sites-enabled/
RUN ln -s /etc/nginx/sites-available/qa.conf /etc/nginx/sites-enabled/
RUN ln -s /etc/nginx/sites-available/flowz.conf /etc/nginx/sites-enabled/
RUN ln -s /etc/nginx/sites-available/distributor.conf /etc/nginx/sites-enabled/
# uncomment chosen locale to enable it's generation
RUN sed -i 's/# gzip_vary on;/gzip_vary on;/' /etc/nginx/nginx.conf
RUN sed -i 's/# gzip_proxied any;/gzip_proxied any;/' /etc/nginx/nginx.conf
RUN sed -i 's/# gzip_comp_level 6;/gzip_comp_level 6;/' /etc/nginx/nginx.conf
RUN sed -i 's/# gzip_buffers 16 8k;/gzip_buffers 16 8k;/' /etc/nginx/nginx.conf
RUN sed -i 's/# gzip_http_version 1.1;/gzip_http_version 1.1;/' /etc/nginx/nginx.conf
RUN sed -i 's/# gzip_types/gzip_types/' /etc/nginx/nginx.conf


WORKDIR /var/www/html
RUN npm install
RUN apt-get install -y default-jre

WORKDIR /opt/app
CMD service nginx start && npm start

#RUN a2enmod rewrite
#RUN a2enmod ssl

#RUN service nginx restart

#RUN a2enmod rewrite
#RUN a2enmod vhost_alias
#RUN service apache2 restart

EXPOSE 80 3032 4032 443
