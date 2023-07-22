const os = require('os');
function getIPAddress() {
  const interfaces = os.networkInterfaces();

  for (let i in interfaces) {
    const iface = interfaces[i];
    for (let j in iface) {
      const alias = iface[j];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return null;
}

module.exports = getIPAddress;