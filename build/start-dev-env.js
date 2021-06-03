const shell = require('shelljs')

shell.echo('##########################')
shell.echo('#     Starting Server    #')
shell.echo('##########################')

shell.cd('spring-server');
shell.exec('mvn spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=electron', {async: true})
shell.cd('..');
shell.cd('angular-frontend');

shell.echo('##########################')
shell.echo('#     Starting Frontend  #')
shell.echo('##########################')

shell.exec('npm run start', {async: true});

