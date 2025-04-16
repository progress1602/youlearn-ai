// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/graphql',
        destination: 'http://164.90.157.191:4884/graphql',
      },
    ];
  },
};
