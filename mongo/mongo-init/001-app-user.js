db = db.getSiblingDB('draftdream');
db.createUser({
  user: 'draftdream_api',
  pwd: 'change-me',
  roles: [{ role: 'readWrite', db: 'draftdream' }]
});
