var RoomFileLister = (function() {
  var room_files = {};

  var RoomFileLister = {
    el: document.getElementById('room-files'),
    list: document.querySelector('#room-files ul'),
    template: document.getElementById('file-local'),

    onfilesloaded: function(file, type) {
      file = file[0];
      if (type === 'add') {
        if(room_files[file.name]){
          room_files[file.name].push(file);
          return;
        }
        room_files[file.name]=[file];
        var el = document.createElement('li');
        el.innerHTML = this.template.innerHTML;

        var a = el.querySelector('a');
        a.href = "#lololololol";
        a.innerText = file.name;

        a.addEventListener('filerequested', function(event){
          return room_files[file.name];
        });

        this.list.innerHTML += el.outerHTML;
      }
    },

    onfilerequested: function(file){
    }
  };

  return RoomFileLister;

})();
