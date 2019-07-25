define(function (require) {
  require('main');
  require('standard_notice');
  require('create_element');
  require('clipboard_copy');
  
  document.addEventListener('DOMContentLoaded', app.init());
});
