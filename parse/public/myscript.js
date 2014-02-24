$(function() {
  var menufile;
  var nutritionfile;

  // Set an event listener on the Choose File field.
  $('#menufileselect').bind("change", function(e) {
    var menufiles = e.target.files || e.dataTransfer.files;
    // Our file var now holds the selected file
    menufile = menufiles[0];
  });

  $('#nutritionfileselect').bind("change", function(e) {
    var nutritionfiles = e.target.files || e.dataTransfer.files;
    // Our file var now holds the selected file
    nutritionfile = nutritionfiles[0];
  });

  // This function is called when the user clicks on Upload Menu to Parse. It will create the REST API request to upload this file to Parse.
  $('#uploadMENUbutton').click(function() {
    var serverUrl = 'https://api.parse.com/1/files/' + menufile.name;

    $.ajax({
      type: "POST",
      beforeSend: function(request) {
        request.setRequestHeader("X-Parse-Application-Id", 'rVx8VLC7uBPJAE8QfqW5zJw90r8vvib4VOAZr1QD');
        request.setRequestHeader("X-Parse-REST-API-Key", 'MaU8mQTxCp6IfpZZQ2jKWi9RO2LpMwQe2jy8WZlt');
        request.setRequestHeader("Content-Type", menufile.type);
      },
      url: serverUrl,
      data: menufile,
      processData: false,
      contentType: false,
      success: function(data) {
        //alert("File available at: " + data.url);
        Parse.initialize("rVx8VLC7uBPJAE8QfqW5zJw90r8vvib4VOAZr1QD", "50NEsTLzulfR7gWr8TwyMNXJZl9CupwfhrQeAftc");
        var query = new Parse.Query("MenuFile");
        query.find({
          success: function(menuFiles) {
            var menuFile;
            if (0 >= nutritionFiles.length) {
              var MenuFile = Parse.Object.extend("MenuFile");
              menuFile = new menuFile();
            } else {
              menuFile = menuFiles[0];
            }
            menuFile.set("file", data);
            menuFile.save(null, {
              success: function(object) {
                alert("File uploaded");
              },
              error: function(data) {
                var obj = jQuery.parseJSON(data);
                alert(obj.error);
              }
            });
          },
          error: function(data) {
            var obj = jQuery.parseJSON(data);
            alert(obj.error);
          }
        });
      },
      error: function(data) {
        var obj = jQuery.parseJSON(data);
        alert(obj.error);
      }
    });
  });

  // This function is called when the user clicks on Upload Nutrition to Parse. It will create the REST API request to upload this file to Parse.
  $('#uploadNUTRITIONbutton').click(function() {
    var serverUrl = 'https://api.parse.com/1/files/' + nutritionfile.name;

    $.ajax({
      type: "POST",
      beforeSend: function(request) {
        request.setRequestHeader("X-Parse-Application-Id", 'rVx8VLC7uBPJAE8QfqW5zJw90r8vvib4VOAZr1QD');
        request.setRequestHeader("X-Parse-REST-API-Key", 'MaU8mQTxCp6IfpZZQ2jKWi9RO2LpMwQe2jy8WZlt');
        request.setRequestHeader("Content-Type", nutritionfile.type);
      },
      url: serverUrl,
      data: nutritionfile,
      processData: false,
      contentType: false,
      success: function(data) {
        //alert("File available at: " + data.url);
        Parse.initialize("rVx8VLC7uBPJAE8QfqW5zJw90r8vvib4VOAZr1QD", "50NEsTLzulfR7gWr8TwyMNXJZl9CupwfhrQeAftc");
        var query = new Parse.Query("NutritionFile");
        query.find({
          success: function(nutritionFiles) {
            var nutritionFile;
            if (0 >= nutritionFiles.length) {
              var NutritionFile = Parse.Object.extend("NutritionFile");
              nutritionFile = new NutritionFile();
            } else {
              nutritionFile = nutritionFiles[0];
            }
            nutritionFile.set("file", data);
            nutritionFile.save(null, {
              success: function(object) {
                alert("File uploaded");
              },
              error: function(data) {
                var obj = jQuery.parseJSON(data);
                alert(obj.error);
              }
            });
          },
          error: function(data) {
            var obj = jQuery.parseJSON(data);
            alert(obj.error);
          }
        });
      },
      error: function(data) {
        var obj = jQuery.parseJSON(data);
        alert(obj.error);
      }
    });
  });
});