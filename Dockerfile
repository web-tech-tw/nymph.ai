FROM node:18

ENV RUNTIME_ENV container

RUN useradd -u 3000 recv

RUN mkdir -p /.npm /workplace
WORKDIR /workplace
ADD . /workplace

RUN chown -R \
    3000:3000 \
    /.npm /workplace

USER 3000
RUN npm install

CMD ["npm", "start"]
