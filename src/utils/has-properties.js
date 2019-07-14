const hasProperties = (obj, ref) => Object.keys(ref).every(prop=>obj.hasOwnProperty(ref[prop]));

module.exports = hasProperties;