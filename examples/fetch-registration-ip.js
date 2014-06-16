var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

module.exports = Promise.method(function (environment) {
  switch(environment) {
  case 'staging':
  case 'production':
    // Magical IP address of Openstack Metadata Service
    // http://docs.openstack.org/grizzly/openstack-compute/admin/content/metadata-service.html
    return request('http://169.254.169.254/latest/meta-data/public-ipv4')
      .then(function (args) {
        var response = args[0];
        var body = args[1];
        if (response.statusCode !== 200) {
          throw new Error("'Unexpected status code! " + response.statusCode);
        }
        return body.trim()
      });
  case 'vagrant':
    return '0.0.0.0';
  default:
    throw new Error("I don't know which IP address to register in this environment: " + environment);
  }
});
