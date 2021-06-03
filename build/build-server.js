const shell = require('shelljs')

shell.echo('##########################')
shell.echo('#     Building Angular   #')
shell.echo('##########################')

shell.cd('angular-frontend')
const PUBLIC = '../spring-server/src/main/resources/public/'
shell.rm('-rf', PUBLIC);
if (shell.exec('npm ci && npm run build').code !== 0) {
  shell.echo('Error: angular build failed')
  shell.exit(1)
}
shell.cp('-R', 'dist/', PUBLIC)
shell.cd('..')

shell.echo('##########################')
shell.echo('#     Building spring    #')
shell.echo('##########################')

shell.cd('spring-server')
if (shell.exec('mvn clean package').code !== 0) {
  shell.echo('Error: spring build failed')
  shell.exit(1)
}
